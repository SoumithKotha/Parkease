const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const QRCode = require('qrcode');
const pool = require('./db');
const redis = require('./redisClient');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ============================================================================
// HELPER: Dynamic Surge Pricing Algorithm (Chinnaswamy / MatchDay Scale)
// ============================================================================
function calculateSurgeRate(baseRate, occupiedSlots, totalSlots) {
  if (!totalSlots || totalSlots === 0) return Number(baseRate).toFixed(2);
  const occupancyRatio = occupiedSlots / totalSlots;

  if (occupancyRatio >= 0.90) return (baseRate * 2.5).toFixed(2); // 90%+ full -> 2.5x surge
  if (occupancyRatio >= 0.75) return (baseRate * 1.8).toFixed(2); // 75%+ full -> 1.8x surge
  if (occupancyRatio >= 0.50) return (baseRate * 1.3).toFixed(2); // 50%+ full -> 1.3x surge

  return Number(baseRate).toFixed(2); // Normal base rate
}

// ============================================================================
// HELPER: Redis Distributed Locks (Lua Script for Safe Release)
// ============================================================================
const RELEASE_LOCK_LUA = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'ParkEase High-Scale API', timestamp: new Date() });
});

// ============================================================================
// 1. FLASH-RUSH VIRTUAL WAITING ROOM (Queue using Redis Sorted Sets)
// ============================================================================
app.post('/api/queue/join', async (req, res) => {
  const { userId, locationId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const queueKey = `waiting_room:${locationId || 'default'}`;
  const now = Date.now();

  try {
    const queueSize = await redis.zcard(queueKey);

    // Add user with microsecond timestamp score (FIFO queue)
    await redis.zadd(queueKey, now, userId);
    const rank = await redis.zrank(queueKey, userId);
    const position = rank + 1;

    // First 10 positions are admitted immediately; subsequent requests are queued
    const isAdmitted = position <= 10;

    res.json({
      inQueue: !isAdmitted,
      position: position,
      estimatedWaitSeconds: Math.max(0, (position - 10) * 3),
      queueSize: queueSize + 1
    });
  } catch (err) {
    // Fail-open strategy: Keep system running if Redis is offline
    res.json({ inQueue: false, position: 1, fallback: true });
  }
});

app.get('/api/queue/status', async (req, res) => {
  const { userId, locationId } = req.query;
  const queueKey = `waiting_room:${locationId || 'default'}`;

  try {
    const rank = await redis.zrank(queueKey, userId);
    if (rank === null) {
      return res.json({ inQueue: false, message: 'Admitted or not currently in queue' });
    }

    const position = rank + 1;
    res.json({
      inQueue: position > 10,
      position: position,
      estimatedWaitSeconds: Math.max(0, (position - 10) * 3)
    });
  } catch (err) {
    res.json({ inQueue: false });
  }
});

// ============================================================================
// 2. SLOTS SEARCH WITH REDIS CACHING, VEHICLE FILTERS & SURGE PRICING
// ============================================================================
app.get('/api/slots/available', async (req, res) => {
  const { locationId, startTime, endTime, slotType } = req.query;

  if (!locationId || !startTime || !endTime) {
    return res.status(400).json({ error: 'locationId, startTime, and endTime are required' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ error: 'Invalid start or end time specified' });
  }

  // Include vehicle type in cache key to keep filters isolated
  const filterKey = slotType && slotType !== 'all' ? `:${slotType.toLowerCase()}` : ':all';
  const cacheKey = `cache:slots:${locationId}:${start.getTime()}_${end.getTime()}${filterKey}`;

  try {
    // 1. Try reading from Redis Cache (sub-millisecond latency)
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({
          source: 'redis_cache',
          ...JSON.parse(cached)
        });
      }
    } catch (e) {
      // Redis offline: fallback to PostgreSQL
    }

    // 2. Build SQL with dynamic slot_type filtering
    let filterClause = '';
    const queryParams = [locationId, start.toISOString(), end.toISOString()];

    if (slotType && slotType !== 'all') {
      queryParams.push(slotType.toLowerCase());
      filterClause = ` AND LOWER(s.slot_type) = $${queryParams.length}`;
    }

    // Query total capacity and available slots concurrently
    const totalSlotsQuery = pool.query(
      `SELECT COUNT(*) FROM parking_slots WHERE location_id = $1 AND is_active = TRUE`,
      [locationId]
    );

    const availableSlotsQuery = pool.query(
      `SELECT s.id, s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type, s.is_active, l.name AS location_name, l.hourly_rate
       FROM parking_slots s
       JOIN parking_locations l ON s.location_id = l.id
       WHERE s.location_id = $1 
         AND s.is_active = TRUE
         ${filterClause}
         AND s.id NOT IN (
           SELECT b.slot_id 
           FROM bookings b
           WHERE b.slot_id = s.id
             AND b.status IN ('confirmed', 'checked_in')
             AND ($2::timestamptz < b.end_time AND $3::timestamptz > b.start_time)
         )
       ORDER BY s.slot_number ASC;`,
      queryParams
    );

    const [totalRes, availRes] = await Promise.all([totalSlotsQuery, availableSlotsQuery]);

    const totalCount = parseInt(totalRes.rows[0].count, 10);
    const availableSlots = availRes.rows;
    const occupiedCount = Math.max(0, totalCount - availableSlots.length);

    // 3. Dynamic Surge Pricing Computation
    const baseRate = availableSlots.length > 0 ? Number(availableSlots[0].hourly_rate) : 15.00;
    const dynamicRate = calculateSurgeRate(baseRate, occupiedCount, totalCount);
    const surgeMultiplier = (dynamicRate / baseRate).toFixed(2);

    // Annotate slot rows with vehicle-type premiums (e.g. +$5 for EV chargers)
    const enrichedSlots = availableSlots.map(s => {
      const isEv = s.slot_type.toLowerCase() === 'ev';
      const typePremium = isEv ? 5.00 : 0.00;
      const finalSlotRate = (parseFloat(dynamicRate) + typePremium).toFixed(2);

      return {
        ...s,
        base_rate: baseRate,
        effective_hourly_rate: parseFloat(finalSlotRate),
        has_ev_premium: isEv,
        is_surge_active: surgeMultiplier > 1.0,
        surge_multiplier: `${surgeMultiplier}x`
      };
    });

    const responsePayload = {
      totalSlots: totalCount,
      occupiedSlots: occupiedCount,
      occupancyPercentage: `${((occupiedCount / (totalCount || 1)) * 100).toFixed(1)}%`,
      baseRate,
      dynamicHourlyRate: parseFloat(dynamicRate),
      surgeMultiplier: `${surgeMultiplier}x`,
      activeFilter: slotType || 'all',
      slots: enrichedSlots
    };

    // 4. Cache in Redis with 10s TTL
    try {
      await redis.set(cacheKey, JSON.stringify(responsePayload), 'EX', 10);
    } catch (e) { }

    res.json({ source: 'database', ...responsePayload });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Database error while searching slots' });
  }
});

// ============================================================================
// 3. BOOKING WITH REDIS DISTRIBUTED LOCK & SURGE SETTLEMENT
// ============================================================================
app.post('/api/bookings', async (req, res) => {
  const { userId, slotId, startTime, endTime } = req.body;

  if (!userId || !slotId || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required booking parameters' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  // --- REDIS DISTRIBUTED ATOMIC LOCK (In-memory 5-minute checkout lock) ---
  const lockKey = `lock:slot:${slotId}:${start.getTime()}_${end.getTime()}`;
  let lockAcquired = false;

  try {
    const lockResult = await redis.set(lockKey, userId, 'NX', 'EX', 300);
    if (!lockResult) {
      return res.status(409).json({
        error: 'High traffic surge! This slot is currently held by another user in checkout. Please select another slot.'
      });
    }
    lockAcquired = true;
  } catch (e) {
    // Redis down: rely on PostgreSQL FOR UPDATE transactional lock below
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Transactional Row Lock on Slot
    const slotCheck = await client.query(
      `SELECT s.id, s.location_id, s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type, s.is_active, l.hourly_rate 
       FROM parking_slots s
       JOIN parking_locations l ON s.location_id = l.id
       WHERE s.id = $1 FOR UPDATE`,
      [slotId]
    );

    if (slotCheck.rows.length === 0 || !slotCheck.rows[0].is_active) {
      await client.query('ROLLBACK');
      if (lockAcquired) await redis.del(lockKey);
      return res.status(400).json({ error: 'Slot is inactive or invalid' });
    }

    const slotData = slotCheck.rows[0];
    const locationId = slotData.location_id;

    // 2. Overlap Verification
    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE slot_id = $1
         AND status IN ('confirmed', 'checked_in')
         AND ($2::timestamptz < end_time AND $3::timestamptz > start_time)
       LIMIT 1;`,
      [slotId, start.toISOString(), end.toISOString()]
    );

    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      if (lockAcquired) await redis.del(lockKey);
      return res.status(409).json({ error: 'Slot has already been reserved for this period' });
    }

    // 3. Dynamic Surge Price Calculation at Confirmation Time
    const totalSlotsRes = await client.query(
      `SELECT COUNT(*) FROM parking_slots WHERE location_id = $1 AND is_active = TRUE`,
      [locationId]
    );
    const occupiedRes = await client.query(
      `SELECT COUNT(DISTINCT slot_id) FROM bookings 
       WHERE status IN ('confirmed', 'checked_in') 
         AND ($1::timestamptz < end_time AND $2::timestamptz > start_time)`,
      [start.toISOString(), end.toISOString()]
    );

    const totalSlots = parseInt(totalSlotsRes.rows[0].count, 10);
    const occupiedSlots = parseInt(occupiedRes.rows[0].count, 10);
    const baseRate = Number(slotData.hourly_rate);
    const dynamicRate = calculateSurgeRate(baseRate, occupiedSlots, totalSlots);

    // Apply EV Fast Charging surcharge if applicable
    const isEv = slotData.slot_type.toLowerCase() === 'ev';
    const effectiveRate = parseFloat(dynamicRate) + (isEv ? 5.00 : 0.00);

    const durationHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const totalAmount = (durationHours * effectiveRate).toFixed(2);

    // 4. Generate Unique QR Token
    const qrHash = crypto.randomBytes(16).toString('hex');

    const insertQuery = `
      INSERT INTO bookings (user_id, slot_id, start_time, end_time, total_amount, qr_code_hash, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
      RETURNING *;
    `;
    const { rows } = await client.query(insertQuery, [
      userId,
      slotId,
      start.toISOString(),
      end.toISOString(),
      totalAmount,
      qrHash,
    ]);

    await client.query('COMMIT');
    const booking = rows[0];

    // Clean up queue entry and flush location cache
    try {
      await redis.zrem(`waiting_room:${locationId}`, userId);
      const cachePattern = `cache:slots:${locationId}:*`;
      const keys = await redis.keys(cachePattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch (e) { }

    // Encode payload inside QR image
    const qrPayload = JSON.stringify({
      bookingId: booking.id,
      qrHash: booking.qr_code_hash,
      slotNumber: slotData.slot_number,
      slotType: slotData.slot_type
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    res.status(201).json({
      message: 'Booking confirmed successfully at MatchDay surge pricing',
      pricingDetails: {
        baseRate,
        surgeRate: Number(dynamicRate),
        effectiveRate,
        hasEvPremium: isEv,
        durationHours,
        totalAmount
      },
      booking,
      qrCode: qrCodeDataUrl,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (lockAcquired) {
      try { await redis.del(lockKey); } catch (e) { }
    }
    console.error('Booking transaction failure:', err);
    res.status(500).json({ error: err.message || 'Error processing reservation' });
  } finally {
    client.release();
  }
});

// ============================================================================
// 4. GATE ENTRY & EXIT VERIFICATION
// ============================================================================
app.post('/api/bookings/verify-entry', async (req, res) => {
  const { bookingId, qrHash } = req.body;

  if (!bookingId || !qrHash) {
    return res.status(400).json({ error: 'bookingId and qrHash are required' });
  }

  try {
    const query = `
      SELECT b.*, s.slot_number, s.slot_type 
      FROM bookings b
      JOIN parking_slots s ON b.slot_id = s.id
      WHERE b.id = $1 AND b.qr_code_hash = $2;
    `;
    const { rows } = await pool.query(query, [bookingId, qrHash]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or fraudulent QR code token' });
    }

    const booking = rows[0];

    if (booking.status === 'checked_in') {
      return res.status(400).json({ message: 'Vehicle is already checked in' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: `Booking has expired or is ${booking.status}` });
    }

    await pool.query(`UPDATE bookings SET status = 'checked_in' WHERE id = $1`, [bookingId]);

    res.json({
      message: `Access Authorized. Barrier Open! Assigned Bay: ${booking.slot_number}`,
      slotNumber: booking.slot_number,
      slotType: booking.slot_type,
      bookingId: booking.id
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error during QR verification' });
  }
});

app.post('/api/bookings/verify-exit', async (req, res) => {
  const { bookingId } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'completed' 
       WHERE id = $1 AND status = 'checked_in' 
       RETURNING *`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Booking is not currently checked in' });
    }

    res.json({
      message: 'Exit authorized. Check-out completed. Slot is now freed.',
      booking: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVER LAUNCH ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 ParkEase MatchDay Engine running on http://localhost:${PORT}`);
});

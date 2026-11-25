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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toValidUuid(rawId) {
  if (rawId && UUID_REGEX.test(String(rawId))) {
    return String(rawId);
  }
  const hash = crypto.createHash('sha256').update(String(rawId || 'guest')).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function generateSixDigitPin(seed) {
  const cleanHex = crypto.createHash('sha256').update(String(seed)).digest('hex');
  const num = parseInt(cleanHex.slice(0, 8), 16) % 1000000;
  return String(num).padStart(6, '0');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

const HYDERABAD_LOCATIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HITEC City • Mindspace Parking Hub',
    address: 'Madhapur, HITEC City Main Rd, Hyderabad',
    hourlyRate: 200.00,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Banjara Hills • GVK One Plaza',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    hourlyRate: 200.00,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Gachibowli • Financial District Lot',
    address: 'Nanakramguda, Financial District, Hyderabad',
    hourlyRate: 200.00,
  },
];

const TEN_SLOTS_TEMPLATE = [
  { slot_number: 'A-01', slot_type: 'compact' },
  { slot_number: 'A-02', slot_type: 'compact' },
  { slot_number: 'A-03', slot_type: 'compact' },
  { slot_number: 'A-04', slot_type: 'compact' },
  { slot_number: 'B-01', slot_type: 'suv' },
  { slot_number: 'B-02', slot_type: 'suv' },
  { slot_number: 'B-03', slot_type: 'suv' },
  { slot_number: 'C-01', slot_type: 'ev' },
  { slot_number: 'C-02', slot_type: 'ev' },
  { slot_number: 'D-01', slot_type: 'accessible' },
];

async function refreshHyderabadSlots(clearBookings = false) {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) DEFAULT 'ParkEase Customer';
    ALTER TABLE parking_slots ADD COLUMN IF NOT EXISTS slot_type VARCHAR(30) DEFAULT 'compact';
  `);

  if (clearBookings) {
    await pool.query(`TRUNCATE TABLE bookings RESTART IDENTITY CASCADE;`);
  }

  await pool.query(`
    INSERT INTO users (id, email, full_name, role)
    VALUES ('00000000-0000-0000-0000-000000000002', 'owner@parkease.com', 'Hyderabad Hub Admin', 'owner'::user_role)
    ON CONFLICT (id) DO NOTHING;
  `);

  for (const loc of HYDERABAD_LOCATIONS) {
    await pool.query(
      `INSERT INTO parking_locations (id, owner_id, name, address, hourly_rate)
       VALUES ($1, '00000000-0000-0000-0000-000000000002', $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, hourly_rate = EXCLUDED.hourly_rate`,
      [loc.id, loc.name, loc.address, loc.hourlyRate]
    );

    for (const bay of TEN_SLOTS_TEMPLATE) {
      await pool.query(
        `INSERT INTO parking_slots (location_id, slot_number, slot_type, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (location_id, slot_number)
         DO UPDATE SET slot_type = EXCLUDED.slot_type, is_active = TRUE`,
        [loc.id, bay.slot_number, bay.slot_type]
      );
    }
  }

  try {
    const keys = await redis.keys('*');
    if (keys.length > 0) await redis.del(...keys);
  } catch { }
}

(async () => {
  try {
    await refreshHyderabadSlots(false);
    console.log('✅ Hyderabad Hubs (3 Locations × 10 Slots = 30 Bays @ ₹200/hr) Ready');
  } catch (err) {
    console.error('Startup seed warning:', err.message);
  }
})();

function calculateSurgeRate(baseRate, occupiedSlots, totalSlots) {
  if (!totalSlots || totalSlots === 0) return Number(baseRate).toFixed(2);
  const occupancyRatio = occupiedSlots / totalSlots;

  if (occupancyRatio >= 0.90) return (baseRate * 2.5).toFixed(2);
  if (occupancyRatio >= 0.75) return (baseRate * 1.8).toFixed(2);
  if (occupancyRatio >= 0.50) return (baseRate * 1.3).toFixed(2);

  return Number(baseRate).toFixed(2);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'ParkEase Hyderabad API', timestamp: new Date() });
});

app.post('/api/slots/refresh', async (req, res) => {
  try {
    await refreshHyderabadSlots(true);
    res.json({ message: 'All previous bookings cleared & all 30 Hyderabad parking slots reset fresh (0/10 occupied).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userId = toValidUuid(cleanEmail);
  const passwordHash = hashPassword(password);
  const dbRole = role === 'owner' ? 'owner' : 'customer';

  try {
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5::user_role)
       RETURNING id, full_name AS name, email, role, created_at`,
      [userId, name?.trim() || 'ParkEase Customer', cleanEmail, passwordHash, dbRole]
    );

    const user = rows[0];
    const autoPin = generateSixDigitPin(user.id);

    res.status(201).json({
      message: 'Account created',
      user: { ...user, pin: autoPin },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.detail || err.message || 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [cleanEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email. Click "Register (New User)" first.' });
    }

    const user = rows[0];
    if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const autoPin = generateSixDigitPin(user.id);

    res.json({
      message: 'Authenticated successfully',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: role || user.role,
        pin: autoPin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.detail || err.message || 'Server error during login' });
  }
});

app.post('/api/queue/join', async (req, res) => {
  const { userId, locationId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const queueKey = `waiting_room:${locationId || 'default'}`;
  const now = Date.now();

  try {
    const queueSize = await redis.zcard(queueKey);
    await redis.zadd(queueKey, now, userId);
    const rank = await redis.zrank(queueKey, userId);
    const position = rank + 1;
    const isAdmitted = position <= 10;

    res.json({
      inQueue: !isAdmitted,
      position,
      estimatedWaitSeconds: Math.max(0, (position - 10) * 3),
      queueSize: queueSize + 1
    });
  } catch {
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
      position,
      estimatedWaitSeconds: Math.max(0, (position - 10) * 3)
    });
  } catch {
    res.json({ inQueue: false });
  }
});

app.get('/api/slots/available', async (req, res) => {
  const { locationId, slotType } = req.query;

  if (!locationId) {
    return res.status(400).json({ error: 'locationId is required' });
  }

  const filterKey = slotType && slotType !== 'all' ? `:${slotType.toLowerCase()}` : ':all';
  const cacheKey = `cache:slots:${locationId}:all_time_now${filterKey}`;

  try {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ source: 'redis_cache', ...JSON.parse(cached) });
      }
    } catch { }

    const totalSlotsQuery = pool.query(
      `SELECT COUNT(*) FROM parking_slots WHERE location_id = $1 AND is_active = TRUE`,
      [locationId]
    );

    const occupiedSlotsQuery = pool.query(
      `SELECT COUNT(DISTINCT b.slot_id)
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE s.location_id = $1
         AND b.status IN ('confirmed', 'checked_in')`,
      [locationId]
    );

    const availParams = [locationId];
    let filterClause = '';
    if (slotType && slotType !== 'all') {
      availParams.push(slotType.toLowerCase());
      filterClause = ` AND LOWER(s.slot_type) = $${availParams.length}`;
    }

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
         )
       ORDER BY s.slot_number ASC;`,
      availParams
    );

    const [totalRes, occRes, availRes] = await Promise.all([
      totalSlotsQuery,
      occupiedSlotsQuery,
      availableSlotsQuery,
    ]);

    const totalCount = parseInt(totalRes.rows[0].count, 10);
    const occupiedCount = parseInt(occRes.rows[0].count, 10);
    const availableSlots = availRes.rows;

    const baseRate = availableSlots.length > 0 ? Number(availableSlots[0].hourly_rate) : 200.00;
    const dynamicRate = calculateSurgeRate(baseRate, occupiedCount, totalCount);
    const surgeMultiplier = (dynamicRate / baseRate).toFixed(2);

    const enrichedSlots = availableSlots.map(s => {
      const isEv = s.slot_type.toLowerCase() === 'ev';
      const typePremium = isEv ? 50.00 : 0.00;
      const finalSlotRate = (parseFloat(dynamicRate) + typePremium).toFixed(2);

      return {
        ...s,
        base_rate: baseRate,
        effective_hourly_rate: parseFloat(finalSlotRate),
        has_ev_premium: isEv,
        is_surge_active: parseFloat(surgeMultiplier) > 1.0,
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

    try {
      await redis.set(cacheKey, JSON.stringify(responsePayload), 'EX', 5);
    } catch { }

    res.json({ source: 'database', ...responsePayload });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Database error while searching slots' });
  }
});

app.get('/api/slots/matrix', async (req, res) => {
  const { locationId } = req.query;
  if (!locationId) return res.status(400).json({ error: 'locationId is required' });

  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type,
              l.name AS location_name, l.address, l.hourly_rate,
              b.id AS booking_id, b.status AS booking_status, b.end_time AS booked_until
       FROM parking_slots s
       JOIN parking_locations l ON s.location_id = l.id
       LEFT JOIN bookings b ON b.slot_id = s.id AND b.status IN ('confirmed', 'checked_in')
       WHERE s.location_id = $1 AND s.is_active = TRUE
       ORDER BY s.slot_number ASC`,
      [locationId]
    );

    const formatted = rows.map((r) => {
      const isEv = r.slot_type.toLowerCase() === 'ev';
      const rate = Number(r.hourly_rate) + (isEv ? 50 : 0);
      return {
        id: r.id,
        slot_number: r.slot_number,
        slot_type: r.slot_type,
        location_name: r.location_name,
        address: r.address,
        hourly_rate: rate,
        is_occupied: Boolean(r.booking_id),
        booking_status: r.booking_status || 'available',
        booked_until: r.booked_until || null,
      };
    });

    res.json({ locationId, total: formatted.length, slots: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { userId, slotId, startTime, endTime } = req.body;

  if (!userId || !slotId || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required booking parameters' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return res.status(400).json({ error: 'Check-out time must be after check-in time' });
  }

  const validUserUuid = toValidUuid(userId);
  const lockKey = `lock:slot:${slotId}:active`;
  let lockAcquired = false;

  try {
    const lockResult = await redis.set(lockKey, validUserUuid, 'NX', 'EX', 300);
    if (!lockResult) {
      return res.status(409).json({
        error: 'High demand! This parking slot is currently being booked by another driver. Please select another slot.'
      });
    }
    lockAcquired = true;
  } catch { }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const slotCheck = await client.query(
      `SELECT s.id, s.location_id, s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type, s.is_active, l.name AS location_name, l.hourly_rate 
       FROM parking_slots s
       JOIN parking_locations l ON s.location_id = l.id
       WHERE s.id = $1 FOR UPDATE`,
      [slotId]
    );

    if (slotCheck.rows.length === 0 || !slotCheck.rows[0].is_active) {
      await client.query('ROLLBACK');
      if (lockAcquired) await redis.del(lockKey);
      return res.status(400).json({ error: 'Parking slot is inactive or invalid' });
    }

    const slotData = slotCheck.rows[0];
    const locationId = slotData.location_id;

    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE slot_id = $1
         AND status IN ('confirmed', 'checked_in')
       LIMIT 1;`,
      [slotId]
    );

    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      if (lockAcquired) await redis.del(lockKey);
      return res.status(409).json({ error: 'Parking slot is already occupied right now' });
    }

    const totalSlotsRes = await client.query(
      `SELECT COUNT(*) FROM parking_slots WHERE location_id = $1 AND is_active = TRUE`,
      [locationId]
    );
    const occupiedRes = await client.query(
      `SELECT COUNT(DISTINCT b.slot_id)
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE s.location_id = $1
         AND b.status IN ('confirmed', 'checked_in')`,
      [locationId]
    );

    const totalSlots = parseInt(totalSlotsRes.rows[0].count, 10);
    const occupiedSlots = parseInt(occupiedRes.rows[0].count, 10);
    const baseRate = Number(slotData.hourly_rate);
    const dynamicRate = calculateSurgeRate(baseRate, occupiedSlots, totalSlots);

    const isEv = slotData.slot_type.toLowerCase() === 'ev';
    const effectiveRate = parseFloat(dynamicRate) + (isEv ? 50.00 : 0.00);

    const durationHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const totalAmount = (durationHours * effectiveRate).toFixed(2);

    const qrHash = crypto.randomBytes(16).toString('hex');
    const gatePin = generateSixDigitPin(validUserUuid);

    try {
      await client.query(
        `INSERT INTO users (id, email, full_name, role)
         VALUES ($1, $2, $3, 'customer'::user_role)
         ON CONFLICT (id) DO NOTHING`,
        [validUserUuid, `${validUserUuid.slice(0, 8)}@parkease.local`, 'ParkEase Customer']
      );
    } catch { }

    const insertQuery = `
      INSERT INTO bookings (user_id, slot_id, start_time, end_time, total_amount, qr_code_hash, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
      RETURNING *;
    `;
    const { rows } = await client.query(insertQuery, [
      validUserUuid,
      slotId,
      start.toISOString(),
      end.toISOString(),
      totalAmount,
      qrHash,
    ]);

    await client.query('COMMIT');
    const booking = rows[0];

    try {
      await redis.del(lockKey);
      await redis.zrem(`waiting_room:${locationId}`, userId);
      const keys = await redis.keys(`cache:slots:${locationId}:*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch { }

    const qrPayload = JSON.stringify({
      bookingId: booking.id,
      qrHash: booking.qr_code_hash,
      gatePin,
      slotNumber: slotData.slot_number,
      slotType: slotData.slot_type
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    res.status(201).json({
      message: 'Booking confirmed! Gate Access PIN active.',
      gatePin,
      pricingDetails: {
        baseRate,
        surgeRate: Number(dynamicRate),
        effectiveRate,
        hasEvPremium: isEv,
        durationHours,
        totalAmount,
        slotNumber: slotData.slot_number,
      },
      booking,
      qrCode: qrCodeDataUrl,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (lockAcquired) {
      try { await redis.del(lockKey); } catch { }
    }
    console.error('Booking transaction failure:', err);
    res.status(500).json({ error: err.detail || err.message || 'Error processing booking' });
  } finally {
    client.release();
  }
});

app.post('/api/bookings/verify-entry', async (req, res) => {
  const { bookingId, qrHash, gateCode } = req.body;

  if (!gateCode && (!bookingId || !qrHash)) {
    return res.status(400).json({ error: 'Provide either your 6-digit PIN or QR pass' });
  }

  try {
    let booking = null;

    if (bookingId && qrHash) {
      const { rows } = await pool.query(
        `SELECT b.*, s.slot_number, s.slot_type, s.location_id
         FROM bookings b JOIN parking_slots s ON b.slot_id = s.id
         WHERE b.id = $1 AND b.qr_code_hash = $2`,
        [bookingId, qrHash]
      );
      booking = rows[0];
    } else if (gateCode) {
      const { rows } = await pool.query(
        `SELECT b.*, s.slot_number, s.slot_type, s.location_id
         FROM bookings b JOIN parking_slots s ON b.slot_id = s.id
         WHERE b.status IN ('confirmed', 'checked_in')
         ORDER BY b.created_at DESC`
      );
      booking = rows.find((r) => generateSixDigitPin(r.user_id) === String(gateCode).trim());
    }

    if (!booking) {
      return res.status(401).json({ error: 'Invalid 6-digit PIN or no active reservation found for this PIN.' });
    }

    if (booking.status === 'checked_in') {
      return res.status(409).json({ error: `Vehicle already checked in at Parking Slot ${booking.slot_number}.` });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: `Booking has expired or is ${booking.status}.` });
    }

    await pool.query(`UPDATE bookings SET status = 'checked_in' WHERE id = $1`, [booking.id]);

    try {
      const keys = await redis.keys(`cache:slots:${booking.location_id}:*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch { }

    res.json({
      message: `Access Authorized. Gate Open! Proceed to Parking Slot ${booking.slot_number}`,
      slotNumber: booking.slot_number,
      slotType: booking.slot_type,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error during gate verification' });
  }
});

app.post('/api/bookings/verify-exit', async (req, res) => {
  const { bookingId, qrHash, gateCode } = req.body;

  if (!gateCode && !bookingId) {
    return res.status(400).json({ error: 'Provide either your 6-digit PIN or Booking ID' });
  }

  try {
    let booking = null;

    if (bookingId) {
      const { rows } = await pool.query(
        `SELECT b.*, s.slot_number, s.location_id
         FROM bookings b JOIN parking_slots s ON b.slot_id = s.id
         WHERE b.id = $1 ${qrHash ? 'AND b.qr_code_hash = $2' : ''}`,
        qrHash ? [bookingId, qrHash] : [bookingId]
      );
      booking = rows[0];
    } else if (gateCode) {
      const { rows } = await pool.query(
        `SELECT b.*, s.slot_number, s.location_id
         FROM bookings b JOIN parking_slots s ON b.slot_id = s.id
         WHERE b.status IN ('checked_in', 'confirmed')
         ORDER BY b.created_at DESC`
      );
      booking = rows.find((r) => generateSixDigitPin(r.user_id) === String(gateCode).trim());
    }

    if (!booking) {
      return res.status(401).json({ error: 'Invalid exit PIN or booking not found.' });
    }

    if (booking.status === 'completed') {
      return res.status(409).json({ error: 'Exit already processed for this pass.' });
    }

    const result = await pool.query(
      `UPDATE bookings SET status = 'completed', end_time = LEAST(end_time, NOW()) WHERE id = $1 RETURNING *`,
      [booking.id]
    );

    try {
      const keys = await redis.keys(`cache:slots:${booking.location_id}:*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch { }

    res.json({
      message: `Exit authorized. Check-out completed. Parking Slot ${booking.slot_number} is now available.`,
      slotNumber: booking.slot_number,
      booking: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  const validUserUuid = toValidUuid(req.params.userId);
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.slot_id, b.start_time, b.end_time, b.total_amount, b.status, b.qr_code_hash,
              s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type,
              l.id AS location_id, l.name AS location_name
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       JOIN parking_locations l ON s.location_id = l.id
       WHERE b.user_id = $1 AND b.status IN ('confirmed', 'checked_in')
       ORDER BY b.created_at DESC`,
      [validUserUuid]
    );

    const enriched = await Promise.all(
      rows.map(async (r) => {
        const gatePin = generateSixDigitPin(validUserUuid);
        const qrCode = await QRCode.toDataURL(
          JSON.stringify({
            bookingId: r.id,
            qrHash: r.qr_code_hash,
            gatePin,
            slotNumber: r.slot_number,
            slotType: r.slot_type,
          })
        );
        return { ...r, gatePin, qrCode };
      })
    );

    res.json({ bookings: enriched });
  } catch (err) {
    console.error('Fetch user bookings error:', err);
    res.status(500).json({ error: 'Failed to load user bookings' });
  }
});

app.post('/api/bookings/:bookingId/refund', async (req, res) => {
  const { bookingId } = req.params;
  const { userId, reason, adminOverride } = req.body;
  const validUserUuid = toValidUuid(userId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT b.*, s.location_id, s.slot_number
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE b.id = $1 FOR UPDATE`,
      [bookingId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = rows[0];
    if (!adminOverride && userId && booking.user_id !== validUserUuid) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized to cancel this reservation.' });
    }

    const allowedStatuses = adminOverride ? ['confirmed', 'checked_in'] : ['confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot refund a booking with status "${booking.status}".`,
      });
    }

    const minutesUntilStart = (new Date(booking.start_time).getTime() - Date.now()) / 60000;
    const refundPercentage = adminOverride || minutesUntilStart >= 30 ? 1.0 : 0.8;
    const originalPaid = Number(booking.total_amount);
    const refundAmount = (originalPaid * refundPercentage).toFixed(2);
    const cancellationFee = (originalPaid - Number(refundAmount)).toFixed(2);

    await client.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [bookingId]);
    await client.query('COMMIT');

    try {
      await redis.del(`lock:slot:${booking.slot_id}:active`);
      const keys = await redis.keys(`cache:slots:${booking.location_id}:*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch { }

    const refundRef = `RFND-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    res.json({
      message: `Booking cancelled. ₹${refundAmount} (${Math.round(refundPercentage * 100)}%) refunded to original payment method.`,
      refundDetails: {
        refundReference: refundRef,
        bookingId: booking.id,
        releasedSlot: booking.slot_number,
        originalAmount: originalPaid.toFixed(2),
        refundAmount,
        cancellationFee,
        reason: reason || 'Driver requested cancellation',
        processedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Refund transaction error:', err);
    res.status(500).json({ error: err.message || 'Failed to process refund' });
  } finally {
    client.release();
  }
});

app.post('/api/bookings/:bookingId/relocate', async (req, res) => {
  const { bookingId } = req.params;
  const { userId, targetLocationId, targetSlotType, adminOverride } = req.body;
  const validUserUuid = toValidUuid(userId);

  if (!targetLocationId) {
    return res.status(400).json({ error: 'targetLocationId is required to relocate booking.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingRes = await client.query(
      `SELECT b.*, s.location_id AS old_location_id, s.slot_number AS old_slot_number
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE b.id = $1 FOR UPDATE`,
      [bookingId]
    );

    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = existingRes.rows[0];
    if (!adminOverride && userId && booking.user_id !== validUserUuid) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized to modify this booking.' });
    }

    const allowedStatuses = adminOverride ? ['confirmed', 'checked_in'] : ['confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Location changes are not allowed for status: ${booking.status}.`,
      });
    }

    const slotParams = [targetLocationId, booking.id];
    let typeClause = '';
    if (targetSlotType && targetSlotType !== 'all') {
      slotParams.push(targetSlotType.toLowerCase());
      typeClause = `AND LOWER(COALESCE(s.slot_type, 'compact')) = $3`;
    }

    const candidateRes = await client.query(
      `SELECT s.id, s.slot_number, COALESCE(s.slot_type, 'compact') AS slot_type,
              l.name AS location_name, l.hourly_rate
       FROM parking_slots s
       JOIN parking_locations l ON s.location_id = l.id
       WHERE s.location_id = $1
         AND s.is_active = TRUE
         ${typeClause}
         AND s.id NOT IN (
           SELECT b2.slot_id FROM bookings b2
           WHERE b2.slot_id = s.id
             AND b2.id <> $2
             AND b2.status IN ('confirmed', 'checked_in')
         )
       ORDER BY s.slot_number ASC
       LIMIT 1
       FOR UPDATE OF s`,
      slotParams
    );

    if (candidateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'No available parking bays at the selected destination hub right now.',
      });
    }

    const newSlot = candidateRes.rows[0];

    const totalSlotsRes = await client.query(
      `SELECT COUNT(*) FROM parking_slots WHERE location_id = $1 AND is_active = TRUE`,
      [targetLocationId]
    );
    const occupiedRes = await client.query(
      `SELECT COUNT(DISTINCT b2.slot_id)
       FROM bookings b2
       JOIN parking_slots s2 ON b2.slot_id = s2.id
       WHERE s2.location_id = $1
         AND b2.status IN ('confirmed', 'checked_in')`,
      [targetLocationId]
    );

    const totalSlots = parseInt(totalSlotsRes.rows[0].count, 10);
    const occupiedSlots = parseInt(occupiedRes.rows[0].count, 10);
    const dynamicRate = calculateSurgeRate(Number(newSlot.hourly_rate), occupiedSlots, totalSlots);
    const isEv = newSlot.slot_type.toLowerCase() === 'ev';
    const effectiveRate = parseFloat(dynamicRate) + (isEv ? 50.0 : 0.0);

    const durationHours = Math.max(
      1,
      Math.ceil((new Date(booking.end_time) - new Date(booking.start_time)) / 3600000)
    );
    const newTotalAmount = Number((durationHours * effectiveRate).toFixed(2));
    const oldPaidAmount = Number(booking.total_amount);
    const fareDifference = Number((newTotalAmount - oldPaidAmount).toFixed(2));

    const newQrHash = crypto.randomBytes(16).toString('hex');
    const gatePin = generateSixDigitPin(booking.user_id);

    const updatedRes = await client.query(
      `UPDATE bookings
       SET slot_id = $1, total_amount = $2, qr_code_hash = $3
       WHERE id = $4
       RETURNING *`,
      [newSlot.id, newTotalAmount.toFixed(2), newQrHash, booking.id]
    );

    await client.query('COMMIT');

    try {
      const oldKeys = await redis.keys(`cache:slots:${booking.old_location_id}:*`);
      const newKeys = await redis.keys(`cache:slots:${targetLocationId}:*`);
      const allKeys = [...oldKeys, ...newKeys];
      if (allKeys.length > 0) await redis.del(...allKeys);
    } catch { }

    const updatedBooking = updatedRes.rows[0];
    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        bookingId: updatedBooking.id,
        qrHash: updatedBooking.qr_code_hash,
        gatePin,
        slotNumber: newSlot.slot_number,
        slotType: newSlot.slot_type,
      })
    );

    res.json({
      message: `Pass relocated to ${newSlot.location_name} (Slot ${newSlot.slot_number}).`,
      gatePin,
      bookedSlotNumber: newSlot.slot_number,
      newLocationId: targetLocationId,
      newLocationName: newSlot.location_name,
      adjustment: {
        previousPaid: oldPaidAmount.toFixed(2),
        newTotal: newTotalAmount.toFixed(2),
        difference: fareDifference,
        settlementStatus:
          fareDifference < 0
            ? `Auto-refunded ₹${Math.abs(fareDifference).toFixed(2)} difference`
            : fareDifference > 0
              ? `Additional ₹${fareDifference.toFixed(2)} billed`
              : 'Even exchange (₹0.00 difference)',
      },
      booking: updatedBooking,
      qrCode: qrCodeDataUrl,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Relocation error:', err);
    res.status(500).json({ error: err.message || 'Failed to relocate booking' });
  } finally {
    client.release();
  }
});

app.get('/api/owner/telemetry', async (req, res) => {
  const { locationId } = req.query;
  if (!locationId) return res.status(400).json({ error: 'locationId is required' });

  try {
    const { rows } = await pool.query(
      `SELECT b.id AS "bookingId", b.qr_code_hash AS "qrHash", b.user_id AS "userId",
              b.status, b.start_time AS "startTime", b.end_time AS "endTime",
              b.total_amount AS "totalAmount", s.slot_number AS "slotNumber", s.slot_type AS "slotType",
              l.name AS "locationName"
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       JOIN parking_locations l ON s.location_id = l.id
       WHERE s.location_id = $1 AND b.status IN ('confirmed', 'checked_in')
       ORDER BY b.created_at DESC`,
      [locationId]
    );

    const enriched = await Promise.all(
      rows.map(async (r) => {
        const gatePin = generateSixDigitPin(r.userId);
        const qrCode = await QRCode.toDataURL(
          JSON.stringify({
            bookingId: r.bookingId,
            qrHash: r.qrHash,
            gatePin,
            slotNumber: r.slotNumber,
            slotType: r.slotType,
          })
        );
        return { ...r, gatePin, qrCode };
      })
    );

    res.json({ activeBookings: enriched, count: enriched.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load owner telemetry' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 ParkEase Hyderabad Engine running on http://localhost:${PORT}`);
});

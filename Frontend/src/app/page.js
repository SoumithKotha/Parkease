'use client';

import { useState, useEffect, useRef } from 'react';

export default function BookingPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const DEFAULT_LOCATION_ID = '11111111-1111-1111-1111-111111111111';

  // Persistent anonymous client token for FIFO Redis queue positioning
  const [clientId, setClientId] = useState('');
  useEffect(() => {
    let id = localStorage.getItem('parkease_client_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('parkease_client_id', id);
    }
    setClientId(id);
  }, []);

  // Form & Filter States
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Waiting Room State
  const [queueState, setQueueState] = useState({
    inQueue: false,
    position: 0,
    estimatedWaitSeconds: 0,
  });
  const queueIntervalRef = useRef(null);

  // Lot Metrics & Surge State
  const [lotMetrics, setLotMetrics] = useState({
    locationName: 'Central Campus Lot A',
    totalSlots: 10,
    occupiedSlots: 0,
    occupancyPercentage: '0%',
    occupancyRatioNum: 0,
    baseRate: 15,
    dynamicHourlyRate: 15,
    surgeMultiplier: '1.00x',
    isSurgeActive: false,
    source: 'initial'
  });

  // Set default start/end dates
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const format = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setStartTime(format(start));
    setEndTime(format(end));
  }, []);

  // Poll waiting room queue position if client is queued
  useEffect(() => {
    if (queueState.inQueue && clientId) {
      queueIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/queue/status?userId=${clientId}&locationId=${DEFAULT_LOCATION_ID}`);
          const data = await res.json();
          if (!data.inQueue) {
            clearInterval(queueIntervalRef.current);
            setQueueState({ inQueue: false, position: 0, estimatedWaitSeconds: 0 });
            // Queue cleared: automatically execute search
            executeSearch();
          } else {
            setQueueState({
              inQueue: true,
              position: data.position,
              estimatedWaitSeconds: data.estimatedWaitSeconds,
            });
          }
        } catch (e) {
          // If queue check errors out, admit user
          clearInterval(queueIntervalRef.current);
          setQueueState({ inQueue: false, position: 0, estimatedWaitSeconds: 0 });
        }
      }, 3000);
    }

    return () => clearInterval(queueIntervalRef.current);
  }, [queueState.inQueue, clientId]);

  // Trigger search with queue check
  const handleSearchSlots = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setConfirmedBooking(null);
    setSelectedSlot(null);

    if (!startTime || !endTime) {
      setErrorMsg('Please select both start and end times.');
      return;
    }

    // Step 1: Check-in with Virtual Waiting Room
    try {
      const qRes = await fetch(`${API_BASE}/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: clientId, locationId: DEFAULT_LOCATION_ID }),
      });
      const qData = await qRes.json();

      if (qData.inQueue) {
        setQueueState({
          inQueue: true,
          position: qData.position,
          estimatedWaitSeconds: qData.estimatedWaitSeconds,
        });
        return; // Halt search until user exits queue
      }
    } catch (e) {
      // Continue search on queue-check network error
    }

    executeSearch();
  };

  const executeSearch = async (overrideFilter = selectedFilter) => {
    setLoadingSlots(true);
    try {
      const filterParam = overrideFilter !== 'all' ? `&slotType=${overrideFilter}` : '';
      const res = await fetch(
        `${API_BASE}/slots/available?locationId=${DEFAULT_LOCATION_ID}&startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}${filterParam}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan inventory');

      const slotsList = data.slots || [];
      const total = data.totalSlots || 10;
      const occupied = data.occupiedSlots !== undefined ? data.occupiedSlots : (total - slotsList.length);
      const ratio = total > 0 ? (occupied / total) : 0;
      const surgeMultiplierNum = parseFloat(data.surgeMultiplier) || 1.0;

      setSlots(slotsList);
      setLotMetrics({
        locationName: 'Central Campus Lot A',
        totalSlots: total,
        occupiedSlots: occupied,
        occupancyPercentage: data.occupancyPercentage || `${Math.round(ratio * 100)}%`,
        occupancyRatioNum: ratio,
        baseRate: data.baseRate || 15,
        dynamicHourlyRate: data.dynamicHourlyRate || 15,
        surgeMultiplier: data.surgeMultiplier || '1.00x',
        isSurgeActive: surgeMultiplierNum > 1.0,
        source: data.source || 'database',
      });

      if (slotsList.length === 0) {
        setErrorMsg(`No active slots found for vehicle type "${overrideFilter.toUpperCase()}".`);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleFilterClick = (filterType) => {
    setSelectedFilter(filterType);
    setSelectedSlot(null);
    if (startTime && endTime) {
      executeSearch(filterType);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setErrorMsg('');
    setBookingLoading(true);

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientId,
          slotId: selectedSlot.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reservation failed');

      setConfirmedBooking(data);
      setSelectedSlot(null);
      executeSearch();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const getSlotTypeBadge = (type) => {
    switch (type) {
      case 'ev':
        return <span style={styles.evBadge}>⚡ EV Fast</span>;
      case 'suv':
        return <span style={styles.suvBadge}>🚙 Large SUV</span>;
      case 'accessible':
        return <span style={styles.accessibleBadge}>♿ Accessible</span>;
      default:
        return <span style={styles.compactBadge}>🚗 Compact</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.navBar}>
        <div style={styles.brandGroup}>
          <span style={styles.brandIcon}>🚗</span>
          <span style={styles.brandName}>ParkEase</span>
        </div>
        <div style={styles.navLinks}>
          <a href="/" style={{ ...styles.navLink, ...styles.navLinkActive }}>Reserve</a>
          <a href="/owner" style={styles.navLink}>Owner Portal</a>
          <a href="/verify" style={styles.navLink}>Verify QR</a>
        </div>
      </header>

      <main style={styles.main}>
        {/* ================================================================= */}
        {/* FLASH-RUSH VIRTUAL WAITING ROOM BANNER                            */}
        {/* ================================================================= */}
        {queueState.inQueue && (
          <div style={styles.queueBanner}>
            <div style={styles.queueHeader}>
              <div style={styles.queuePulseIndicator} />
              <strong style={{ fontSize: '1.05rem', color: '#fbbf24' }}>
                MatchDay Flash Rush Detected! Traffic Surge in Progress
              </strong>
            </div>
            <p style={styles.queueText}>
              To ensure fair allocation, you have entered our priority queue. You are currently{' '}
              <span style={styles.queueRank}>#{queueState.position}</span> in line.
            </p>
            <div style={styles.queueProgressDetails}>
              <span>Estimated wait time: <strong>~{queueState.estimatedWaitSeconds} seconds</strong></span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Powered by Redis FIFO Sorted Sets</span>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section
          style={{
            ...styles.heroBanner,
            background: lotMetrics.isSurgeActive
              ? 'linear-gradient(135deg, #431407 0%, #7c2d12 40%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
            border: lotMetrics.isSurgeActive ? '1px solid #ea580c' : '1px solid #6366f1'
          }}
        >
          <div style={styles.heroTopRow}>
            <div>
              <div style={styles.heroCategoryBadge}>
                {lotMetrics.isSurgeActive ? '⚡ FLASH SURGE ACTIVE' : 'SMART PARKING MANAGEMENT'}
              </div>
              <h1 style={styles.heroTitle}>Reserve Your Parking Slot</h1>
              <p style={styles.heroSubtitle}>
                Select your schedule to view live slot availability, dynamic pricing, and get an instant entry pass.
              </p>
            </div>

            <div style={styles.locationBadgeGroup}>
              <div style={styles.locationPill}>📍 {lotMetrics.locationName}</div>
              <div style={styles.ratePill}>
                Base Rate: <strong>${lotMetrics.dynamicHourlyRate}/hr</strong>
                {lotMetrics.isSurgeActive && <span style={styles.baseCrossedOut}>(${lotMetrics.baseRate})</span>}
              </div>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div style={styles.meterContainer}>
            <div style={styles.meterHeader}>
              <div style={styles.meterStats}>
                Occupancy: <strong>{lotMetrics.occupiedSlots} / {lotMetrics.totalSlots} Slots Taken</strong> ({lotMetrics.occupancyPercentage})
              </div>
              {lotMetrics.isSurgeActive ? (
                <div style={styles.surgeTag}>🔥 {lotMetrics.surgeMultiplier} Surge Active</div>
              ) : (
                <div style={styles.normalTag}>🟢 Standard Demand (1.00x)</div>
              )}
            </div>
            <div style={styles.progressBarBg}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: lotMetrics.occupancyPercentage,
                  backgroundColor:
                    lotMetrics.occupancyRatioNum >= 0.75
                      ? '#ef4444'
                      : lotMetrics.occupancyRatioNum >= 0.5
                        ? '#f59e0b'
                        : '#10b981'
                }}
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* VEHICLE TYPE & EV FILTER PILLS                                    */}
        {/* ================================================================= */}
        <div style={styles.filterBar}>
          <span style={styles.filterLabel}>Vehicle Type:</span>
          <div style={styles.filterPills}>
            {[
              { id: 'all', label: 'All Spots' },
              { id: 'compact', label: '🚗 Compact / Sedan' },
              { id: 'suv', label: '🚙 SUV' },
              { id: 'ev', label: '⚡ EV Fast Charger' },
              { id: 'accessible', label: '♿ Accessible' },
            ].map((f) => {
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFilterClick(f.id)}
                  style={{
                    ...styles.filterButton,
                    backgroundColor: isActive ? '#38bdf8' : '#1e293b',
                    color: isActive ? '#0f172a' : '#94a3b8',
                    borderColor: isActive ? '#38bdf8' : '#334155',
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Search Form */}
        <section style={styles.searchCard}>
          <form onSubmit={handleSearchSlots} style={styles.searchForm}>
            <div style={styles.inputBlock}>
              <label style={styles.inputLabel}>START TIME</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={styles.timeInput}
                required
              />
            </div>

            <div style={styles.inputBlock}>
              <label style={styles.inputLabel}>END TIME</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.timeInput}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingSlots || queueState.inQueue}
              style={{ ...styles.searchBtn, opacity: (loadingSlots || queueState.inQueue) ? 0.7 : 1 }}
            >
              {loadingSlots ? 'Scanning...' : '🔍 Find Available Slots'}
            </button>
          </form>
        </section>

        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        {/* Slot Grid */}
        {slots.length > 0 && (
          <section style={styles.slotsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Available Parking Bays</h2>
              <span style={styles.cacheBadge}>
                {lotMetrics.source === 'redis_cache' ? '⚡ Served via Redis Cache' : '🗄️ Fresh DB Scan'}
              </span>
            </div>

            <div style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      ...styles.slotCard,
                      border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                      backgroundColor: isSelected ? '#1e3a8a' : '#1e293b'
                    }}
                  >
                    <span style={styles.slotId}>{slot.slot_number}</span>
                    {getSlotTypeBadge(slot.slot_type)}
                    <span style={styles.slotRate}>${slot.effective_hourly_rate}/hr</span>
                    {slot.is_surge_active && (
                      <span style={styles.slotSurgePill}>{slot.surge_multiplier}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selection Action Bar */}
            {selectedSlot && (
              <div style={styles.checkoutBar}>
                <div>
                  <div style={styles.selectedSlotName}>
                    Selected Bay: <strong>{selectedSlot.slot_number}</strong> ({selectedSlot.slot_type?.toUpperCase()})
                  </div>
                  <div style={styles.selectedPriceInfo}>
                    Rate: ${selectedSlot.effective_hourly_rate}/hr
                    {selectedSlot.slot_type === 'ev' && ' (Includes +$5 EV Charging Utility)'}
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  style={styles.confirmBtn}
                >
                  {bookingLoading ? 'Acquiring Distributed Lock...' : 'Lock Slot & Issue Pass'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Pass Modal / Confirmed Card */}
        {confirmedBooking && (
          <section style={styles.confirmationCard}>
            <div style={styles.passHeader}>
              <span style={styles.confirmedBadge}>PASS ACTIVE</span>
              <span style={styles.bookingRef}>ID: {confirmedBooking.booking.id.slice(0, 8)}...</span>
            </div>

            <h3 style={styles.passTitle}>Reservation Confirmed!</h3>
            <p style={styles.passSubtitle}>Scan this pass at the gate boom barrier to enter.</p>

            <div style={styles.qrBox}>
              <img
                src={confirmedBooking.qrCode}
                alt="Entry QR"
                style={styles.qrImg}
              />
            </div>

            <div style={styles.passDetails}>
              <div>Assigned Bay: <strong>{selectedSlot?.slot_number || 'Confirmed'}</strong></div>
              <div>Duration: <strong>{confirmedBooking.pricingDetails?.durationHours} hrs</strong></div>
              <div>Total Billed: <strong>${confirmedBooking.booking.total_amount}</strong></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Inline Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    paddingBottom: '60px',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 36px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0f172a',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandIcon: {
    fontSize: '1.5rem',
  },
  brandName: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  navLinkActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  main: {
    maxWidth: '1050px',
    margin: '32px auto 0 auto',
    padding: '0 20px',
  },
  queueBanner: {
    backgroundColor: '#1c1917',
    border: '1px solid #f59e0b',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  queueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  queuePulseIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 8px #f59e0b',
  },
  queueText: {
    margin: '0 0 10px 0',
    color: '#d6d3d1',
    fontSize: '0.95rem',
  },
  queueRank: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '1.1rem',
  },
  queueProgressDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#fbbf24',
    borderTop: '1px dashed #44403c',
    paddingTop: '8px',
  },
  heroBanner: {
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px',
  },
  heroTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px',
  },
  heroCategoryBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  heroSubtitle: {
    color: '#e2e8f0',
    fontSize: '0.95rem',
    maxWidth: '560px',
    margin: 0,
    lineHeight: 1.5,
  },
  locationBadgeGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  locationPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  ratePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  baseCrossedOut: {
    textDecoration: 'line-through',
    color: '#94a3b8',
    marginLeft: '6px',
    fontSize: '0.8rem',
  },
  meterContainer: {
    marginTop: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  meterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  meterStats: {
    fontSize: '0.88rem',
    color: '#f8fafc',
  },
  surgeTag: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '800',
  },
  normalTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
    border: '1px solid #059669',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  progressBarBg: {
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.4s ease',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#94a3b8',
  },
  filterPills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterButton: {
    border: '1px solid',
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  searchCard: {
    backgroundColor: '#1e293b',
    borderRadius: '14px',
    border: '1px solid #334155',
    padding: '20px 24px',
    marginBottom: '24px',
  },
  searchForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '16px',
    alignItems: 'end',
  },
  inputBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '700',
  },
  timeInput: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  searchBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 24px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    height: '42px',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  slotsSection: {
    marginTop: '28px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
  },
  cacheBadge: {
    fontSize: '0.75rem',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(56, 189, 248, 0.25)',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  slotCard: {
    borderRadius: '10px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    position: 'relative',
  },
  slotId: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  compactBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: '#cbd5e1',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  suvBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fcd34d',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  evBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    color: '#67e8f9',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  accessibleBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    color: '#d8b4fe',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  slotRate: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  slotSurgePill: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    backgroundColor: '#ea580c',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '2px 5px',
    borderRadius: '4px',
  },
  checkoutBar: {
    marginTop: '20px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSlotName: {
    fontSize: '1rem',
    color: '#f8fafc',
  },
  selectedPriceInfo: {
    fontSize: '0.85rem',
    color: '#38bdf8',
    marginTop: '4px',
  },
  confirmBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '11px 22px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  confirmationCard: {
    marginTop: '32px',
    backgroundColor: '#1e293b',
    border: '1px solid #10b981',
    borderRadius: '14px',
    padding: '28px',
    textAlign: 'center',
    maxWidth: '460px',
    margin: '32px auto 0 auto',
  },
  passHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  confirmedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #059669',
  },
  bookingRef: {
    color: '#64748b',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
  },
  passTitle: {
    margin: '0 0 6px 0',
    fontSize: '1.35rem',
  },
  passSubtitle: {
    color: '#94a3b8',
    fontSize: '0.88rem',
    margin: '0 0 16px 0',
  },
  qrBox: {
    backgroundColor: '#ffffff',
    display: 'inline-block',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  qrImg: {
    width: '180px',
    height: '180px',
    display: 'block',
  },
  passDetails: {
    borderTop: '1px dashed #334155',
    paddingTop: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#cbd5e1',
  },
};

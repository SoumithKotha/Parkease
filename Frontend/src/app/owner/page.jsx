'use client';

import { useState, useEffect } from 'react';

export default function BookingPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const DEFAULT_LOCATION_ID = '11111111-1111-1111-1111-111111111111';
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [slots, setSlots] = useState([]);
    const [lotStats, setLotStats] = useState(null); // Stores occupancy & surge info
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000);
        const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);

        const pad = (n) => String(n).padStart(2, '0');
        const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setStartTime(format(start));
        setEndTime(format(end));
    }, []);

    const handleSearchSlots = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        setConfirmedBooking(null);
        setSelectedSlot(null);

        setLoadingSlots(true);
        try {
            const res = await fetch(
                `${API_BASE}/slots/available?locationId=${DEFAULT_LOCATION_ID}&startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to search slots');

            // data now contains { slots, dynamicHourlyRate, surgeMultiplier, occupancyPercentage }
            setSlots(data.slots || []);
            setLotStats({
                occupancyPercentage: data.occupancyPercentage,
                dynamicHourlyRate: data.dynamicHourlyRate,
                surgeMultiplier: data.surgeMultiplier,
                isSurgeActive: parseFloat(data.surgeMultiplier) > 1.0,
            });

            if (!data.slots || data.slots.length === 0) {
                setErrorMsg('All parking slots are fully occupied for this time window.');
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoadingSlots(false);
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
                    userId: DEMO_USER_ID,
                    slotId: selectedSlot.id,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reservation failed');

            setConfirmedBooking(data);
            setSelectedSlot(null);
            handleSearchSlots();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', padding: '30px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ color: '#38bdf8', marginBottom: '8px' }}>ParkEase — MatchDay Booking Engine</h1>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Real-time concurrency locks & surge pricing</p>

                {/* Surge Pricing Alert Banner */}
                {lotStats?.isSurgeActive && (
                    <div style={{ backgroundColor: '#7c2d12', border: '1px solid #ea580c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🔥 <strong>High Demand / Surge Active:</strong> MatchDay traffic has pushed lot occupancy to {lotStats.occupancyPercentage}.</span>
                        <span style={{ backgroundColor: '#ea580c', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{lotStats.surgeMultiplier} Surge</span>
                    </div>
                )}

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '12px', background: '#1e293b', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                    />
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                    />
                    <button
                        onClick={handleSearchSlots}
                        disabled={loadingSlots}
                        style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loadingSlots ? 'Scanning...' : 'Search Inventory'}
                    </button>
                </div>

                {errorMsg && <div style={{ color: '#f87171', marginBottom: '16px' }}>{errorMsg}</div>}

                {/* Slots Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                    {slots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                            <div
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                                    backgroundColor: isSelected ? '#1e3a8a' : '#1e293b',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{slot.slot_number}</div>
                                <div style={{ color: '#4ade80', fontSize: '0.8rem', marginTop: '4px' }}>Available</div>
                                <div style={{ color: slot.is_surge_active ? '#fb923c' : '#94a3b8', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>
                                    ${slot.effective_hourly_rate}/hr
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected Slot Action */}
                {selectedSlot && (
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <span>Locking Spot: <strong>{selectedSlot.slot_number}</strong></span>
                            <span style={{ marginLeft: '16px', color: '#38bdf8' }}>Rate: ${selectedSlot.effective_hourly_rate}/hr</span>
                        </div>
                        <button
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {bookingLoading ? 'Securing Lock...' : 'Confirm & Generate Ticket'}
                        </button>
                    </div>
                )}

                {/* QR Confirmation Card */}
                {confirmedBooking && (
                    <div style={{ background: '#1e293b', border: '1px solid #059669', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                        <h3 style={{ color: '#34d399', margin: '0 0 12px 0' }}>Ticket Confirmed & Slot Locked!</h3>
                        <img src={confirmedBooking.qrCode} alt="Entry Pass" style={{ width: '180px', height: '180px', borderRadius: '8px', background: '#fff', padding: '8px' }} />
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '12px' }}>Total Amount: ${confirmedBooking.pricingDetails.totalAmount} ({confirmedBooking.pricingDetails.durationHours} hrs)</p>
                    </div>
                )}
            </div>
        </div>
    );
}

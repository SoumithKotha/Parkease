'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  RefreshCw,
  Flame,
  CheckCircle2,
  Building2,
  IndianRupee,
  Activity,
  MapPin,
  ChevronDown,
  Check,
  KeyRound,
  ArrowRightLeft,
  RotateCcw,
  Copy,
  Printer,
  ArrowRight,
  LogIn,
  LogOut,
  X,
  AlertTriangle,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const LOCATIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HITEC City • Mindspace Parking Hub',
    address: 'Madhapur, HITEC City Main Rd, Hyderabad',
    baseRate: 200,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Banjara Hills • GVK One Plaza',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    baseRate: 200,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Gachibowli • Financial District Lot',
    address: 'Nanakramguda, Financial District, Hyderabad',
    baseRate: 200,
  },
];

export default function OwnerPortal() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(LOCATIONS[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [lotStats, setLotStats] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedPass, setSelectedPass] = useState(null);
  const [manageMode, setManageMode] = useState(null);
  const [targetHubId, setTargetHubId] = useState(LOCATIONS[1].id);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageBanner, setManageBanner] = useState(null);
  const [copiedPin, setCopiedPin] = useState(false);

  const currentLocation = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0],
    [selectedLocationId]
  );

  useEffect(() => {
    const role = sessionStorage.getItem('parkease_user_role');
    if (!role) {
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);

    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const format = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setStartTime(format(start));
    setEndTime(format(end));
  }, [router]);

  const fetchTelemetry = async (locId = selectedLocationId) => {
    try {
      const res = await fetch(`${API_BASE}/owner/telemetry?locationId=${locId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveBookings(data.activeBookings || []);
      }
    } catch { }
  };

  const handleSearchSlots = async (e, locId = selectedLocationId) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMsg('');
    setConfirmedBooking(null);
    setSelectedSlot(null);
    setLoadingSlots(true);

    try {
      const [slotsRes] = await Promise.all([
        fetch(`${API_BASE}/slots/available?locationId=${locId}&allTime=true`),
        fetchTelemetry(locId),
      ]);

      const data = await slotsRes.json();
      if (!slotsRes.ok) throw new Error(data.error || 'Failed to query inventory');

      setSlots(data.slots || []);
      setLotStats({
        totalSlots: data.totalSlots || 10,
        occupiedSlots: data.occupiedSlots || 0,
        occupancyPercentage: data.occupancyPercentage || '0%',
        dynamicHourlyRate: data.dynamicHourlyRate || 200,
        surgeMultiplier: data.surgeMultiplier || '1.00x',
        isSurgeActive: parseFloat(data.surgeMultiplier) > 1.0,
        source: data.source || 'database',
      });

      if (!data.slots || data.slots.length === 0) {
        setErrorMsg('All parking bays are fully occupied right now.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleSearchSlots(null, selectedLocationId);
    }
  }, [isAuthenticated, selectedLocationId]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setErrorMsg('');
    setBookingLoading(true);

    const activeClientId =
      (typeof window !== 'undefined' && sessionStorage.getItem('parkease_client_id')) ||
      '00000000-0000-0000-0000-000000000002';

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeClientId,
          slotId: selectedSlot.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reservation failed');

      setConfirmedBooking(data);
      setSelectedSlot(null);
      handleSearchSlots(null, selectedLocationId);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSelectReservation = (b) => {
    const hrs = Math.max(
      1,
      Math.ceil((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3600000)
    );
    setSelectedPass({
      ...b,
      durationHours: hrs,
      isRefunded: false,
    });
    setManageMode(null);
    setManageBanner(null);
    setTargetHubId(LOCATIONS.find((l) => l.id !== selectedLocationId)?.id || LOCATIONS[0].id);
  };

  const handleCopyGatePin = () => {
    if (!selectedPass?.gatePin) return;
    navigator.clipboard.writeText(selectedPass.gatePin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleRelocatePass = async () => {
    if (!selectedPass?.bookingId) return;
    setManageLoading(true);
    setManageBanner(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedPass.bookingId}/relocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedPass.userId,
          targetLocationId: targetHubId,
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Relocation failed');

      setManageMode(null);
      setSelectedPass((prev) => ({
        ...prev,
        slotNumber: data.bookedSlotNumber,
        locationName: data.newLocationName,
        gatePin: data.gatePin,
        qrCode: data.qrCode,
        totalAmount: data.booking?.total_amount || prev.totalAmount,
      }));
      setManageBanner({
        ok: true,
        text: data.message,
        detail: data.adjustment?.settlementStatus,
      });
      handleSearchSlots(null, selectedLocationId);
    } catch (err) {
      setManageBanner({ ok: false, text: err.message });
    } finally {
      setManageLoading(false);
    }
  };

  const handleRefundPass = async () => {
    if (!selectedPass?.bookingId) return;
    setManageLoading(true);
    setManageBanner(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedPass.bookingId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedPass.userId,
          reason: 'Owner Portal cancellation & refund',
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');

      setManageMode(null);
      setSelectedPass((prev) => ({ ...prev, isRefunded: true }));
      setManageBanner({
        ok: true,
        text: data.message,
        detail: `Refund Ref: ${data.refundDetails?.refundReference} • Released Slot ${data.refundDetails?.releasedSlot}`,
      });
      handleSearchSlots(null, selectedLocationId);
    } catch (err) {
      setManageBanner({ ok: false, text: err.message });
    } finally {
      setManageLoading(false);
    }
  };

  const handleGateAction = async (direction) => {
    if (!selectedPass?.bookingId) return;
    setManageLoading(true);
    setManageBanner(null);
    const endpoint =
      direction === 'entry'
        ? `${API_BASE}/bookings/verify-entry`
        : `${API_BASE}/bookings/verify-exit`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedPass.bookingId,
          qrHash: selectedPass.qrHash,
          gateCode: selectedPass.gatePin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gate verification failed');

      setManageMode(null);
      setSelectedPass((prev) =>
        direction === 'exit'
          ? { ...prev, isRefunded: true, status: 'completed' }
          : { ...prev, status: 'checked_in' }
      );
      setManageBanner({
        ok: true,
        text: data.message,
      });
      handleSearchSlots(null, selectedLocationId);
    } catch (err) {
      setManageBanner({ ok: false, text: err.message });
    } finally {
      setManageLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1222] text-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#F5B21B]" /> Hyderabad Facility Administration
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Owner Management Portal
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {currentLocation.name} — Concurrency monitoring, dynamic surge control, and live Gate PIN auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/15 text-xs font-bold text-white transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F5B21B]" />
                <span className="max-w-[200px] truncate">{currentLocation.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#132A4F] border border-white/20 shadow-2xl p-2 z-50">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setDropdownOpen(false);
                        setSelectedPass(null);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${loc.id === selectedLocationId
                        ? 'bg-[#1D4ED8]/40 text-white font-bold border border-[#F5B21B]/40'
                        : 'text-slate-300 hover:bg-white/5'
                        }`}
                    >
                      <div>
                        <div>{loc.name}</div>
                        <div className="text-[11px] text-slate-400">{loc.address}</div>
                      </div>
                      {loc.id === selectedLocationId && <Check className="w-3.5 h-3.5 text-[#F5B21B] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/10 text-xs font-bold text-slate-200 transition"
            >
              Customer View
            </Link>
            <button
              onClick={(e) => handleSearchSlots(e, selectedLocationId)}
              disabled={loadingSlots}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5B21B] to-[#FCD34D] text-[#0B1222] text-xs font-extrabold shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSlots ? 'animate-spin' : ''}`} />
              <span>Run Telemetry Scan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#132A4F]/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>FACILITY OCCUPANCY</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {lotStats ? lotStats.occupancyPercentage : '0.0%'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {lotStats ? `${lotStats.occupiedSlots} of ${lotStats.totalSlots} Bays Booked` : '10 Total Bays registered'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#132A4F]/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>CURRENT RATE</span>
              <IndianRupee className="w-4 h-4 text-[#F5B21B]" />
            </div>
            <div className="text-2xl font-black text-[#F5B21B]">
              ₹{lotStats ? Number(lotStats.dynamicHourlyRate).toFixed(0) : '200'}
              <span className="text-xs font-medium text-slate-400">/hr</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Base: ₹200/hr (Excl. ₹50 EV surcharge)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#132A4F]/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>SURGE MULTIPLIER</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {lotStats ? lotStats.surgeMultiplier : '1.00x'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {lotStats?.isSurgeActive ? '🔥 Peak Algorithm Active' : '🟢 Standard Demand'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#132A4F]/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>CONCURRENCY LOCKS</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">Redis FIFO</div>
            <div className="text-xs text-slate-400 mt-1">
              Source: {lotStats?.source || 'Online'}
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-2xl p-6 bg-[#132A4F]/50 border border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Schedule Inventory Window
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#0B1222] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B21B]"
              />
            </div>
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#0B1222] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B21B]"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={(e) => handleSearchSlots(e, selectedLocationId)}
                disabled={loadingSlots}
                className="w-full h-[42px] rounded-xl bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingSlots ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Inspect Window'}
              </button>
            </div>
          </div>
        </section>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {activeBookings.length > 0 && (
          <section className="mb-8 rounded-2xl p-6 bg-[#132A4F]/50 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#F5B21B]" />
                  <span>Active Reservations & Gate PINs ({activeBookings.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any slot card below to open its full Parking Pass, QR code, Change Location, Manage Gate, and Refund controls.
                </p>
              </div>
              <Link href="/verify" className="text-xs font-bold text-[#F5B21B] hover:underline">
                Open Gate Terminal →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBookings.map((b) => {
                const isSelected = selectedPass?.bookingId === b.bookingId;
                return (
                  <div
                    key={b.bookingId}
                    onClick={() => handleSelectReservation(b)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${isSelected
                      ? 'bg-[#1D4ED8]/35 border-[#F5B21B] shadow-[0_0_20px_rgba(245,178,27,0.35)]'
                      : 'bg-[#0B1222]/90 border-white/10 hover:border-[#F5B21B]/50'
                      }`}
                  >
                    <div>
                      <div className="text-sm font-black text-white font-mono">
                        Slot {b.slotNumber}{' '}
                        <span className="text-[11px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 ml-1">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Amount: <strong className="text-slate-200">₹{b.totalAmount}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gate PIN</span>
                      <span className="text-lg font-black font-mono text-[#F5B21B] tracking-wider">
                        {b.gatePin}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPass && (
              <div className="mt-8 max-w-xl mx-auto">
                <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#132A4F] to-[#0B1222] border-2 ${selectedPass.isRefunded ? 'border-rose-500/60' : 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'} text-center relative overflow-hidden`}>
                  <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${selectedPass.isRefunded ? 'from-rose-500 via-amber-500 to-rose-500' : 'from-emerald-400 via-[#F5B21B] to-emerald-400'}`} />

                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    {selectedPass.isRefunded ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase">
                        RELEASED / REFUNDED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PARKING PASS ACTIVE ({selectedPass.status})
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">REF: {selectedPass.bookingId?.slice(0, 8)}...</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPass(null);
                          setManageMode(null);
                        }}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
                        aria-label="Close pass"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedPass.isRefunded ? 'Pass Released' : 'Booking Confirmed!'}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                    {selectedPass.isRefunded
                      ? 'The parking bay has been released back into live inventory.'
                      : `Scan QR pass or enter 6-digit Gate PIN at ${selectedPass.locationName || currentLocation.name}.`}
                  </p>

                  {!selectedPass.isRefunded && (
                    <>
                      <div className="mt-5 p-4 rounded-2xl bg-[#0B1222]/90 border border-[#F5B21B]/50">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#FCD34D] block">
                          6-Digit Gate Keypad PIN
                        </span>
                        <span className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-white font-mono mt-1 block">
                          {selectedPass.gatePin}
                        </span>
                      </div>

                      <div className="my-6 inline-block p-4 rounded-2xl bg-white shadow-2xl">
                        {selectedPass.qrCode ? (
                          <img
                            src={selectedPass.qrCode}
                            alt="Gate Entry QR"
                            className="w-48 h-48 sm:w-56 sm:h-56 block mx-auto object-contain"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-mono">
                            QR Pass Active
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#0B1222]/80 border border-white/10 text-center mb-6">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Slot</span>
                          <span className="text-lg font-black text-[#F5B21B] font-mono">{selectedPass.slotNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                          <span className="text-lg font-black text-white">{selectedPass.durationHours} hrs</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                          <span className="text-lg font-black text-emerald-400">₹{selectedPass.totalAmount}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopyGatePin}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Copy className="w-4 h-4 text-[#F5B21B]" />
                          <span>{copiedPin ? 'Gate PIN Copied!' : 'Copy 6-Digit PIN'}</span>
                        </button>
                        <Link
                          href="/verify"
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition"
                        >
                          <span>Open Gate Terminal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Pass</span>
                        </button>
                      </div>

                      <div className="mt-5 pt-5 border-t border-white/10 text-left space-y-3">
                        {!manageMode && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetHubId(LOCATIONS.find((l) => l.id !== selectedLocationId)?.id || LOCATIONS[0].id);
                                setManageMode('relocate');
                                setManageBanner(null);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-[#1D4ED8]/25 hover:bg-[#1D4ED8]/40 border border-blue-400/30 text-xs font-bold text-blue-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-[#F5B21B]" />
                              <span>Change Location</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setManageMode('manage');
                                setManageBanner(null);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Manage Gate</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setManageMode('refund');
                                setManageBanner(null);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                              <span>Cancel & Refund</span>
                            </button>
                          </div>
                        )}

                        {manageMode === 'relocate' && (
                          <div className="p-4 rounded-2xl bg-[#0B1222] border border-blue-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-blue-300 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#F5B21B]" /> Transfer Pass to Another Hyderabad Hub
                              </span>
                              <button type="button" onClick={() => setManageMode(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <select
                              value={targetHubId}
                              onChange={(e) => setTargetHubId(e.target.value)}
                              className="w-full rounded-xl bg-[#132A4F] border border-white/15 px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#F5B21B]"
                            >
                              {LOCATIONS.map((hub) => (
                                <option key={hub.id} value={hub.id}>
                                  {hub.name}
                                </option>
                              ))}
                            </select>

                            <p className="text-[11px] text-slate-400">
                              Your 6-digit Gate PIN stays active; any rate difference is auto-settled.
                            </p>

                            <button
                              type="button"
                              onClick={handleRelocatePass}
                              disabled={manageLoading}
                              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                            >
                              {manageLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Hub Transfer'}
                            </button>
                          </div>
                        )}

                        {manageMode === 'manage' && (
                          <div className="p-4 rounded-2xl bg-[#0B1222] border border-emerald-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Manage Gate Barrier (Slot {selectedPass.slotNumber})
                              </span>
                              <button type="button" onClick={() => setManageMode(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleGateAction('entry')}
                                disabled={manageLoading || selectedPass.status === 'checked_in'}
                                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Authorize Entry</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleGateAction('exit')}
                                disabled={manageLoading}
                                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-[#0B1222] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Complete Exit & Free Bay</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {manageMode === 'refund' && (
                          <div className="p-4 rounded-2xl bg-[#0B1222] border border-rose-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-rose-300">
                                Confirm Cancellation & Refund
                              </span>
                              <button type="button" onClick={() => setManageMode(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-xs text-slate-300">
                              Issues full refund and immediately releases Slot {selectedPass.slotNumber} back into live availability.
                            </p>

                            <button
                              type="button"
                              onClick={handleRefundPass}
                              disabled={manageLoading}
                              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                            >
                              {manageLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Process Refund & Release Slot'}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {manageBanner && (
                    <div
                      className={`mt-4 p-3.5 rounded-xl border text-left text-xs flex items-start gap-2.5 ${manageBanner.ok
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                        }`}
                    >
                      {manageBanner.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{manageBanner.text}</div>
                        {manageBanner.detail && <div className="text-[11px] opacity-80 mt-0.5">{manageBanner.detail}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {slots.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Live Bay Matrix ({slots.length} Available)
              </h2>
              <span className="text-xs text-slate-400">
                Click any bay to test owner lock
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition select-none ${isSelected
                      ? 'bg-[#1D4ED8] border-[#F5B21B] shadow-[0_0_15px_rgba(245,178,27,0.4)]'
                      : 'bg-[#132A4F]/60 border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="font-mono text-lg font-black">{slot.slot_number}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      {slot.slot_type}
                    </div>
                    <div className="text-xs font-bold text-[#F5B21B] mt-1">
                      ₹{slot.effective_hourly_rate}/hr
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlot && (
              <div className="p-4 rounded-2xl bg-[#0B1222] border border-[#F5B21B] flex items-center justify-between gap-4 mt-6">
                <div className="text-sm">
                  <span>Selected Bay: <strong className="text-[#F5B21B]">{selectedSlot.slot_number}</strong></span>
                  <span className="text-slate-400 ml-3">Rate: ₹{selectedSlot.effective_hourly_rate}/hr</span>
                </div>
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase transition disabled:opacity-50 cursor-pointer"
                >
                  {bookingLoading ? 'Acquiring Lock...' : 'Issue Test Ticket'}
                </button>
              </div>
            )}

            {confirmedBooking && (
              <div className="mt-6 p-6 rounded-2xl bg-[#132A4F] border border-emerald-500 text-center max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-3">
                  <CheckCircle2 className="w-5 h-5" /> Test Reservation Confirmed
                </div>
                {confirmedBooking.gatePin && (
                  <div className="mb-3 px-4 py-2 rounded-xl bg-[#0B1222] border border-[#F5B21B]/40 inline-block">
                    <span className="text-[10px] uppercase text-slate-400 block">Gate PIN</span>
                    <span className="text-xl font-black font-mono text-[#F5B21B] tracking-widest">
                      {confirmedBooking.gatePin}
                    </span>
                  </div>
                )}
                <img
                  src={confirmedBooking.qrCode}
                  alt="QR Pass"
                  className="w-40 h-40 mx-auto rounded-xl bg-white p-2"
                />
                <div className="text-xs text-slate-300 mt-3 font-mono">
                  Ref: {confirmedBooking.booking?.id?.slice(0, 8)}...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

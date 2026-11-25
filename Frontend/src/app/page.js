'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Clock, Car, MapPin, RefreshCw, CheckCircle2, AlertTriangle,
  Flame, ArrowRight, Sparkles, Ticket, Copy, Printer, ChevronDown, Info,
  Check, KeyRound, ArrowRightLeft, RotateCcw, X
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const LOCATIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HITEC City • Mindspace Parking Hub',
    address: 'Madhapur, HITEC City Main Rd, Hyderabad',
    baseRate: 200,
    features: ['EV Fast Chargers', 'Covered Multi-Level', '24/7 ANPR Security']
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Banjara Hills • GVK One Plaza',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    baseRate: 200,
    features: ['Valet Service', 'EV Charging Bays', 'VIP Lounge Access']
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Gachibowli • Financial District Lot',
    address: 'Nanakramguda, Financial District, Hyderabad',
    baseRate: 200,
    features: ['Automated Barriers', 'Wide SUV Bays', 'CCTV Monitored']
  },
];

const FILTERS = [
  { id: 'all', label: 'All Slots' },
  { id: 'compact', label: 'Compact / Sedan' },
  { id: 'suv', label: 'Large SUV' },
  { id: 'ev', label: 'EV Fast Charger' },
  { id: 'accessible', label: 'Accessible' },
];

const SLOT_BADGES = {
  ev: { cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', text: 'EV Fast' },
  suv: { cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', text: 'Large SUV' },
  accessible: { cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30', text: 'Accessible' },
  compact: { cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30', text: 'Compact' },
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const generateUuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

const formatDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function BookingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(LOCATIONS[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const [clientId, setClientId] = useState('');
  const [userPin, setUserPin] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [userActiveBookings, setUserActiveBookings] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [queueState, setQueueState] = useState({ inQueue: false, position: 0, estimatedWaitSeconds: 0 });
  const queueIntervalRef = useRef(null);

  const [manageMode, setManageMode] = useState(null);
  const [targetHubId, setTargetHubId] = useState(LOCATIONS[1].id);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageBanner, setManageBanner] = useState(null);

  const currentLocation = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0],
    [selectedLocationId]
  );

  const [lotMetrics, setLotMetrics] = useState({
    totalSlots: 10, occupiedSlots: 0, occupancyPercentage: '0%', occupancyRatioNum: 0,
    baseRate: 200, dynamicHourlyRate: 200, surgeMultiplier: '1.00x', isSurgeActive: false, source: 'initial',
  });

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    updateMenuPosition();

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const formatActivePass = (active) => {
    const hrs = Math.max(
      1,
      Math.ceil((new Date(active.end_time).getTime() - new Date(active.start_time).getTime()) / 3600000)
    );
    return {
      booking: active,
      gatePin: active.gatePin,
      qrCode: active.qrCode,
      bookedSlotNumber: active.slot_number,
      locationName: active.location_name,
      locationId: active.location_id,
      pricingDetails: { durationHours: hrs },
    };
  };

  const executeSearch = async (filter = selectedFilter, locId = selectedLocationId) => {
    setLoadingSlots(true);
    try {
      const filterParam = filter !== 'all' ? `&slotType=${filter}` : '';
      const res = await fetch(
        `${API_BASE}/slots/available?locationId=${locId}&allTime=true${filterParam}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load parking slots');

      const list = data.slots || [];
      const total = data.totalSlots || 10;
      const occupied = data.occupiedSlots ?? Math.max(0, total - list.length);
      const ratio = total > 0 ? occupied / total : 0;
      const mult = parseFloat(data.surgeMultiplier) || 1.0;
      const locBase = LOCATIONS.find((l) => l.id === locId)?.baseRate || 200;

      setSlots(list);
      setLotMetrics({
        totalSlots: total,
        occupiedSlots: occupied,
        occupancyPercentage: data.occupancyPercentage || `${Math.round(ratio * 100)}%`,
        occupancyRatioNum: ratio,
        baseRate: data.baseRate || locBase,
        dynamicHourlyRate: data.dynamicHourlyRate || locBase,
        surgeMultiplier: data.surgeMultiplier || '1.00x',
        isSurgeActive: mult > 1.0,
        source: data.source || 'database',
      });

      if (list.length === 0) setErrorMsg(`No parking slots available for "${filter.toUpperCase()}" right now.`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadUserBookings = async (uid, autoOpenFirst = false) => {
    if (!uid) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.bookings || [];
        setUserActiveBookings(list);
        if (autoOpenFirst && list.length > 0) {
          setConfirmedBooking(formatActivePass(list[0]));
        }
      }
    } catch { }
  };

  useEffect(() => {
    const role = sessionStorage.getItem('parkease_user_role');
    const savedId = sessionStorage.getItem('parkease_client_id');

    if (!role || !savedId || !UUID_REGEX.test(savedId)) {
      router.replace('/login');
      return;
    }

    setClientId(savedId);
    setUserPin(sessionStorage.getItem('parkease_user_pin') || '');
    setIsAuthenticated(true);

    const now = Date.now();
    setStartTime(formatDateTimeLocal(new Date(now)));
    setEndTime(formatDateTimeLocal(new Date(now + 7200000)));

    loadUserBookings(savedId, true);
    executeSearch('all', LOCATIONS[0].id);
  }, [router]);

  const durationHours = useMemo(() => {
    const s = new Date(startTime).getTime();
    const e = new Date(endTime).getTime();
    return (!s || !e || e <= s) ? 0 : Math.max(1, Math.ceil((e - s) / 3600000));
  }, [startTime, endTime]);

  useEffect(() => {
    if (!queueState.inQueue || !clientId) return;
    queueIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/queue/status?userId=${clientId}&locationId=${selectedLocationId}`);
        const data = await res.json();
        if (!data.inQueue) {
          clearInterval(queueIntervalRef.current);
          setQueueState({ inQueue: false, position: 0, estimatedWaitSeconds: 0 });
          executeSearch();
        } else {
          setQueueState({ inQueue: true, position: data.position, estimatedWaitSeconds: data.estimatedWaitSeconds });
        }
      } catch {
        clearInterval(queueIntervalRef.current);
        setQueueState({ inQueue: false, position: 0, estimatedWaitSeconds: 0 });
      }
    }, 3000);
    return () => clearInterval(queueIntervalRef.current);
  }, [queueState.inQueue, clientId, selectedLocationId]);

  const handleSearchSlots = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSelectedSlot(null);

    if (!startTime || !endTime || new Date(endTime) <= new Date(startTime)) {
      return setErrorMsg('End time must be after start time.');
    }

    try {
      const res = await fetch(`${API_BASE}/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: clientId, locationId: selectedLocationId }),
      });
      const qData = await res.json();
      if (qData.inQueue) {
        return setQueueState({ inQueue: true, position: qData.position, estimatedWaitSeconds: qData.estimatedWaitSeconds });
      }
    } catch { }

    executeSearch();
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setErrorMsg('');
    setManageBanner(null);
    setManageMode(null);
    setBookingLoading(true);

    const validUuid = UUID_REGEX.test(clientId) ? clientId : generateUuid();

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: validUuid,
          slotId: selectedSlot.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setConfirmedBooking({
        ...data,
        bookedSlotNumber: selectedSlot.slot_number,
        locationName: currentLocation.name,
        locationId: selectedLocationId,
      });
      setSelectedSlot(null);
      executeSearch();
      loadUserBookings(validUuid, false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRelocatePass = async () => {
    if (!confirmedBooking?.booking?.id) return;
    setManageLoading(true);
    setManageBanner(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${confirmedBooking.booking.id}/relocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientId,
          targetLocationId: targetHubId,
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Relocation failed');

      setSelectedLocationId(targetHubId);
      setConfirmedBooking((prev) => ({
        ...prev,
        ...data,
        bookedSlotNumber: data.bookedSlotNumber,
        locationName: data.newLocationName,
        locationId: targetHubId,
      }));
      setManageMode(null);
      setManageBanner({
        ok: true,
        text: data.message,
        detail: data.adjustment?.settlementStatus,
      });
      executeSearch(selectedFilter, targetHubId);
      loadUserBookings(clientId, false);
    } catch (err) {
      setManageBanner({ ok: false, text: err.message });
    } finally {
      setManageLoading(false);
    }
  };

  const handleRefundPass = async () => {
    if (!confirmedBooking?.booking?.id) return;
    setManageLoading(true);
    setManageBanner(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${confirmedBooking.booking.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientId,
          reason: 'Driver cancelled pass',
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');

      setManageMode(null);
      setManageBanner({
        ok: true,
        text: data.message,
        detail: `Refund Ref: ${data.refundDetails?.refundReference} • Released Slot ${data.refundDetails?.releasedSlot}`,
      });
      setConfirmedBooking((prev) => ({ ...prev, isRefunded: true }));
      executeSearch();
      loadUserBookings(clientId, false);
    } catch (err) {
      setManageBanner({ ok: false, text: err.message });
    } finally {
      setManageLoading(false);
    }
  };

  const handleCopyGatePin = () => {
    if (!confirmedBooking) return;
    const textToCopy = confirmedBooking.gatePin || userPin || JSON.stringify({
      bookingId: confirmedBooking.booking?.id,
      qrHash: confirmedBooking.booking?.qr_code_hash,
    });
    navigator.clipboard.writeText(textToCopy);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  if (!isAuthenticated) {
    return null;
  }

  const demandBadge = lotMetrics.occupancyRatioNum >= 0.75
    ? { cls: 'bg-red-500/20 text-red-300 border-red-500/40', dot: 'bg-red-500 radar-dot', text: 'High Demand Peak' }
    : lotMetrics.occupancyRatioNum >= 0.5
      ? { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: 'bg-amber-400', text: 'Moderate Demand' }
      : { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400', text: 'Optimum Availability' };

  const progressGradient = lotMetrics.occupancyRatioNum >= 0.75
    ? 'from-amber-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
    : lotMetrics.occupancyRatioNum >= 0.5
      ? 'from-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(245,178,27,0.5)]'
      : 'from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';

  return (
    <div className="min-h-screen bg-[#0B1222] text-[#F8FAFC] pb-24 selection:bg-[#F5B21B] selection:text-[#0B1222]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#1D4ED8]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#F5B21B]/8 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {queueState.inQueue && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#7C2D12]/90 via-[#451A03] to-[#1E1B4B] border border-amber-500/60 p-5 shadow-[0_0_30px_rgba(245,178,27,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-4 h-4 rounded-full bg-amber-400 mt-1 shrink-0 radar-dot" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40">High Traffic Surge</span>
                    <strong className="text-base sm:text-lg font-bold text-amber-200">Virtual Waiting Room Active</strong>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">
                    You are position <span className="text-[#FCD34D] font-extrabold">#{queueState.position}</span> in line. You will be admitted automatically.
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-amber-500/30 pt-3 sm:pt-0 sm:pl-6 text-right">
                <span className="text-xs text-amber-300/80 uppercase font-semibold">Est. Wait</span>
                <span className="text-2xl font-black text-[#F5B21B]">~{queueState.estimatedWaitSeconds}s</span>
              </div>
            </div>
          </div>
        )}

        {userActiveBookings.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#132A4F]/90 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase">
                {userActiveBookings.length} ACTIVE {userActiveBookings.length === 1 ? 'PASS' : 'PASSES'}
              </span>
              {userActiveBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setManageBanner(null);
                    setManageMode(null);
                    setConfirmedBooking(formatActivePass(b));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${confirmedBooking?.booking?.id === b.id && !confirmedBooking?.isRefunded
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-[#0B1222]/80 text-slate-200 border-white/15 hover:border-emerald-400/50'
                    }`}
                >
                  {b.location_name.split('•')[0].trim()} • Slot <span className="font-mono text-[#F5B21B]">{b.slot_number}</span>
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-300">
              Gate PIN: <strong className="font-mono text-white">{userActiveBookings[0].gatePin}</strong>
            </span>
          </div>
        )}

        <section className={`mb-8 rounded-3xl p-6 sm:p-8 border transition-all duration-500 shadow-2xl relative ${lotMetrics.isSurgeActive ? 'bg-gradient-to-br from-[#7C2D12] via-[#132A4F] to-[#0B1222] border-amber-500/50' : 'bg-gradient-to-br from-[#162C5B] via-[#102344] to-[#0B1222] border-blue-500/30'}`}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase mb-3 border">
                {lotMetrics.isSurgeActive
                  ? <span className="flex items-center gap-1.5 text-amber-300"><Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> PEAK PRICING ACTIVE ({lotMetrics.surgeMultiplier})</span>
                  : <span className="flex items-center gap-1.5 text-blue-300"><Sparkles className="w-3.5 h-3.5 text-[#F5B21B]" /> HYDERABAD SMART PARKING OS</span>}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Book Your Parking Slot</h1>
              <p className="mt-2 text-base text-slate-300 max-w-xl">Choose your arrival and departure times across Hyderabad&apos;s prime hubs to view live slot availability and unlock instant gate entry.</p>

              <div className="mt-5 inline-block">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => {
                    updateMenuPosition();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0B1222] hover:bg-[#080E1B] border border-white/15 text-sm font-medium transition shadow-lg group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#F5B21B]/15 border border-[#F5B21B]/30 flex items-center justify-center text-[#F5B21B]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Selected Location • Hyderabad</span>
                    <span className="text-white font-bold group-hover:text-[#FCD34D]">{currentLocation.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#F5B21B]' : ''}`} />
                </button>
              </div>
            </div>

            <div className="lg:min-w-[280px] flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-[#0B1222]/80 border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>HOURLY RATE</span>
                  {lotMetrics.isSurgeActive ? <span className="text-amber-400 font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Peak Rate</span> : <span className="text-emerald-400 font-bold">Standard Rate</span>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">₹{Number(lotMetrics.dynamicHourlyRate).toFixed(0)}</span>
                  <span className="text-sm font-semibold text-slate-400">/hr</span>
                  {lotMetrics.isSurgeActive && <span className="text-sm text-slate-500 line-through font-semibold">₹{Number(lotMetrics.baseRate).toFixed(0)}</span>}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rate Multiplier:</span>
                  <span className={`font-black px-2 py-0.5 rounded-full ${lotMetrics.isSurgeActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>{lotMetrics.surgeMultiplier}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
                <Info className="w-3.5 h-3.5 text-[#F5B21B] shrink-0" />
                <span>EV charging slots include +₹50/hr utility fee</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-400">Live Occupancy (As of Now):</span>
                <span className="text-sm font-black text-white">{lotMetrics.occupiedSlots} / {lotMetrics.totalSlots} Parking Slots Occupied</span>
                <span className="text-xs font-bold text-[#F5B21B] bg-[#F5B21B]/15 px-2 py-0.5 rounded-md border border-[#F5B21B]/30">{lotMetrics.occupancyPercentage}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${demandBadge.cls}`}>
                <span className={`w-2 h-2 rounded-full ${demandBadge.dot}`} /> {demandBadge.text}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#0B1222]/80 p-0.5 border border-white/10 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${progressGradient}`} style={{ width: lotMetrics.occupancyPercentage }} />
            </div>
          </div>
        </section>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Car className="w-4 h-4 text-[#F5B21B]" /> Vehicle Type:</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Filter parking slots by vehicle size & EV charging</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelectedFilter(f.id); setSelectedSlot(null); executeSearch(f.id); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border cursor-pointer ${selectedFilter === f.id ? 'bg-[#F5B21B] text-[#0B1222] border-[#F5B21B] shadow-[0_0_20px_rgba(245,178,27,0.35)]' : 'bg-[#132A4F]/60 text-slate-300 border-white/10 hover:bg-[#132A4F]'}`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <section className="mb-8 rounded-3xl p-6 sm:p-7 bg-[#132A4F]/70 border border-white/10 shadow-xl">
          <form onSubmit={handleSearchSlots} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#F5B21B]" /> Check-In Time</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#0B1222] border border-white/15 focus:border-[#F5B21B] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none" required />
              </div>
              <div className="md:col-span-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F5B21B]" /> Check-Out Time</label>
                  {durationHours > 0 && <span className="text-[11px] font-bold text-[#FCD34D] bg-[#0B1222] px-2 py-0.5 rounded-full border border-white/10">Duration: {durationHours} {durationHours === 1 ? 'hr' : 'hrs'}</span>}
                </div>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-[#0B1222] border border-white/15 focus:border-[#F5B21B] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loadingSlots || queueState.inQueue} className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-extrabold text-sm flex items-center justify-center gap-2 border border-blue-400/30 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer">
                  {loadingSlots ? <><RefreshCw className="w-4 h-4 animate-spin text-[#F5B21B]" /><span>Searching...</span></> : <><span>Find Slots</span><ArrowRight className="w-4 h-4 text-[#F5B21B]" /></>}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-semibold">Quick Duration:</span>
              {[1, 2, 3, 6, 12].map((hrs) => (
                <button key={hrs} type="button" onClick={() => setEndTime(formatDateTimeLocal(new Date((startTime ? new Date(startTime).getTime() : Date.now()) + hrs * 3600000)))} className="px-2.5 py-1 rounded-lg bg-[#0B1222]/70 hover:bg-[#1D4ED8]/30 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer">
                  +{hrs} {hrs === 12 ? 'Hrs (Half Day)' : hrs === 1 ? 'Hr' : 'Hrs'}
                </button>
              ))}
            </div>
          </form>
        </section>

        {errorMsg && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{errorMsg}</div>
            <button onClick={() => setErrorMsg('')} className="text-xs text-red-300 hover:text-white underline font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {slots.length > 0 && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-white">Available Parking Slots</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#132A4F] text-xs font-black text-[#F5B21B] border border-[#F5B21B]/30">{slots.length} Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border ${lotMetrics.source === 'redis_cache' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                  {lotMetrics.source === 'redis_cache' ? 'Live Cache' : 'Live Database'}
                </span>
                <button onClick={() => executeSearch()} disabled={loadingSlots} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/15 text-xs font-bold text-slate-200 transition cursor-pointer">
                  <RefreshCw className={`w-3.5 h-3.5 text-[#F5B21B] ${loadingSlots ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const badge = SLOT_BADGES[slot.slot_type?.toLowerCase()] || SLOT_BADGES.compact;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`relative p-4 sm:p-5 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-between text-center select-none ${isSelected ? 'bg-gradient-to-b from-[#1E3A8A] to-[#132A4F] border-2 border-[#F5B21B] shadow-[0_0_25px_rgba(245,178,27,0.4)] z-20' : 'bg-[#132A4F]/50 border border-white/10 hover:border-[#F5B21B]/40 hover:bg-[#132A4F]/90 hover:-translate-y-1'}`}
                  >
                    {slot.is_surge_active && <span className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black">{slot.surge_multiplier}</span>}
                    {isSelected && <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#F5B21B] text-[#0B1222] flex items-center justify-center font-bold text-xs">✓</span>}

                    <div className="w-12 h-12 rounded-2xl bg-[#0B1222] border border-white/10 flex items-center justify-center mb-2.5">
                      <span className="text-xl font-black text-white font-mono">{slot.slot_number}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border mb-2 ${badge.cls}`}>{badge.text}</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 radar-dot" /><span>Available</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 w-full">
                      <span className="text-base font-black text-[#F5B21B]">₹{slot.effective_hourly_rate}</span>
                      <span className="text-[11px] text-slate-400 font-semibold">/hr</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlot && (
              <div className="sticky bottom-6 z-40 mt-8 rounded-3xl p-5 sm:p-6 bg-[#0B1222]/95 border-2 border-[#F5B21B] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5B21B] text-[#0B1222] flex flex-col items-center justify-center font-black shrink-0">
                      <span className="text-[10px] uppercase font-bold">SLOT</span>
                      <span className="text-xl leading-none font-mono">{selectedSlot.slot_number}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">Selected Slot {selectedSlot.slot_number}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#132A4F] text-[#FCD34D] border border-white/10 uppercase">{selectedSlot.slot_type}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-3">
                        <span>Rate: <strong>₹{selectedSlot.effective_hourly_rate}/hr</strong></span><span>•</span>
                        <span>Duration: <strong>{durationHours} {durationHours === 1 ? 'hr' : 'hrs'}</strong></span><span>•</span>
                        <span className="text-[#F5B21B] font-bold">Total: ₹{(durationHours * selectedSlot.effective_hourly_rate).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {userPin && (
                      <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#132A4F] border border-[#F5B21B]/40 text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-[#F5B21B]" />
                        <span className="text-slate-300 font-semibold">Gate PIN:</span>
                        <span className="font-mono font-black text-white tracking-wider">{userPin}</span>
                      </div>
                    )}

                    <button type="button" onClick={() => setSelectedSlot(null)} className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer">Cancel</button>
                    <button type="button" onClick={handleConfirmBooking} disabled={bookingLoading} className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F5B21B] to-[#FCD34D] text-[#0B1222] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer">
                      {bookingLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Booking...</span></> : <><Ticket className="w-4 h-4" /><span>Book Slot & Get Pass</span></>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {confirmedBooking && (
          <section className="mt-12 max-w-xl mx-auto">
            <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#132A4F] to-[#0B1222] border-2 ${confirmedBooking.isRefunded ? 'border-rose-500/60' : 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'} text-center relative overflow-hidden`}>
              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${confirmedBooking.isRefunded ? 'from-rose-500 via-amber-500 to-rose-500' : 'from-emerald-400 via-[#F5B21B] to-emerald-400'}`} />
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                {confirmedBooking.isRefunded ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase">
                    CANCELLED & REFUNDED
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PARKING PASS ACTIVE
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">REF: {confirmedBooking.booking?.id?.slice(0, 8)}...</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {confirmedBooking.isRefunded ? 'Pass Cancelled' : 'Booking Confirmed!'}
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                {confirmedBooking.isRefunded
                  ? 'Your parking bay has been released and your refund has been issued.'
                  : `Scan your QR pass or enter your 6-digit Gate PIN at ${confirmedBooking.locationName || currentLocation.name}.`}
              </p>

              {!confirmedBooking.isRefunded && (
                <>
                  {(confirmedBooking.gatePin || userPin) && (
                    <div className="mt-5 p-4 rounded-2xl bg-[#0B1222]/90 border border-[#F5B21B]/50">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#FCD34D] block">
                        6-Digit Gate Keypad PIN
                      </span>
                      <span className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-white font-mono mt-1 block">
                        {confirmedBooking.gatePin || userPin}
                      </span>
                    </div>
                  )}

                  <div className="my-6 inline-block p-4 rounded-2xl bg-white shadow-2xl">
                    {confirmedBooking.qrCode
                      ? <img src={confirmedBooking.qrCode} alt="Gate Entry QR" className="w-48 h-48 sm:w-56 sm:h-56 block mx-auto object-contain" />
                      : <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-mono">QR Generated</div>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#0B1222]/80 border border-white/10 text-center mb-6">
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Slot</span><span className="text-lg font-black text-[#F5B21B] font-mono">{confirmedBooking.bookedSlotNumber || 'A-01'}</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span><span className="text-lg font-black text-white">{confirmedBooking.pricingDetails?.durationHours || durationHours} hrs</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span><span className="text-lg font-black text-emerald-400">₹{confirmedBooking.booking?.total_amount}</span></div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button type="button" onClick={handleCopyGatePin} className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer">
                      <Copy className="w-4 h-4 text-[#F5B21B]" /><span>{copiedPin ? 'Gate PIN Copied!' : 'Copy 6-Digit PIN'}</span>
                    </button>
                    <Link href="/verify" className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition">
                      <span>Open Gate Terminal</span><ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button type="button" onClick={() => window.print()} className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                      <Printer className="w-4 h-4" /><span>Print Pass</span>
                    </button>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/10 text-left space-y-3">
                    {!manageMode && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const activeLoc = confirmedBooking.locationId || selectedLocationId;
                            setTargetHubId(LOCATIONS.find((l) => l.id !== activeLoc)?.id || LOCATIONS[0].id);
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
                          100% refund if cancelled 30+ mins before check-in (80% within 30 mins). Your bay will be released immediately.
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
          </section>
        )}
      </div>

      {dropdownOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="absolute w-80 sm:w-[440px] rounded-2xl bg-[#0F2140] border border-white/25 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-2.5 z-[99999]"
          >
            <div className="text-xs font-bold text-slate-400 uppercase px-3 py-2 border-b border-white/10">
              Select Hyderabad Parking Hub
            </div>
            <div className="space-y-1.5 mt-1.5">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setDropdownOpen(false);
                    executeSearch(selectedFilter, loc.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl cursor-pointer transition flex items-start justify-between gap-3 ${loc.id === selectedLocationId
                    ? 'bg-[#1D4ED8]/50 border border-[#F5B21B]/60 text-white'
                    : 'hover:bg-white/10 text-slate-300 border border-transparent'
                    }`}
                >
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>{loc.name}</span>
                      {loc.id === selectedLocationId && <Check className="w-3.5 h-3.5 text-[#F5B21B]" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{loc.address}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {loc.features.map((f) => (
                        <span key={f} className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F5B21B] shrink-0">₹{loc.baseRate}/hr</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MapPin,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Zap,
    Car,
    Sparkles,
    Layers,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const HYDERABAD_HUBS = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'HITEC City • Mindspace Parking Hub',
        address: 'Madhapur, HITEC City Main Rd, Hyderabad',
        tag: 'IT Corridor',
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Banjara Hills • GVK One Plaza',
        address: 'Road No. 1, Banjara Hills, Hyderabad',
        tag: 'Central Retail',
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Gachibowli • Financial District Lot',
        address: 'Nanakramguda, Financial District, Hyderabad',
        tag: 'Financial Hub',
    },
];

const TYPE_STYLES = {
    compact: { label: 'Compact', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    suv: { label: 'Large SUV', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    ev: { label: 'EV Fast', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    accessible: { label: 'Accessible', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
};

export default function LiveSlotsDirectoryPage() {
    const [matrices, setMatrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const loadAllHubs = async (forceRefresh = false) => {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);
        setStatusMsg('');

        try {
            if (forceRefresh) {
                await fetch(`${API_BASE}/slots/refresh`, { method: 'POST' });
            }

            const results = await Promise.all(
                HYDERABAD_HUBS.map(async (hub) => {
                    const res = await fetch(`${API_BASE}/slots/matrix?locationId=${hub.id}`);
                    const data = await res.json();
                    return [hub.id, data.slots || []];
                })
            );

            setMatrices(Object.fromEntries(results));
            if (forceRefresh) {
                setStatusMsg('All 30 parking bays across Hyderabad refreshed & synced.');
            }
        } catch {
            setStatusMsg('Unable to reach backend on port 5001.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAllHubs(false);
    }, []);

    const totalBays = Object.values(matrices).reduce((acc, list) => acc + list.length, 0);
    const availableBays = Object.values(matrices).reduce(
        (acc, list) => acc + list.filter((s) => !s.is_occupied).length,
        0
    );

    return (
        <div className="min-h-screen bg-[#0B1222] text-white pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#F5B21B]/15 text-[#F5B21B] border border-[#F5B21B]/30 mb-2">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Hyderabad Live Bay Directory • 10 Slots / Hub</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                            All Parking Slots Matrix
                        </h1>
                        <p className="text-sm text-slate-300 mt-1">
                            Real-time bay availability across HITEC City, Banjara Hills, and Gachibowli ({availableBays} of {totalBays || 30} open).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => loadAllHubs(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1D4ED8]/30 border border-white/15 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-[#F5B21B] ${refreshing ? 'animate-spin' : ''}`} />
                            <span>{refreshing ? 'Refreshing Slots...' : 'Refresh All Slots'}</span>
                        </button>

                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5B21B] to-[#FCD34D] text-[#0B1222] text-xs font-black shadow-lg"
                        >
                            <span>Reserve a Bay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {statusMsg && (
                    <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{statusMsg}</span>
                    </div>
                )}

                {/* 3 Separate Hyderabad Location Cards (10 Slots Each) */}
                <div className="space-y-8">
                    {HYDERABAD_HUBS.map((hub) => {
                        const hubSlots = matrices[hub.id] || [];
                        const openCount = hubSlots.filter((s) => !s.is_occupied).length;

                        return (
                            <section
                                key={hub.id}
                                className="rounded-3xl p-6 bg-[#111C33] border border-white/10 shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#F5B21B]/15 border border-[#F5B21B]/30 flex items-center justify-center text-[#F5B21B] shrink-0 mt-0.5">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg sm:text-xl font-black text-white">{hub.name}</h2>
                                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                                    {hub.tag}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{hub.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-xl bg-[#0B1222] border border-white/10 text-xs font-bold">
                                            <span className="text-emerald-400">{openCount}</span>
                                            <span className="text-slate-400"> / {hubSlots.length || 10} Available</span>
                                        </span>
                                        <span className="text-sm font-black text-[#F5B21B]">₹200/hr</span>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="py-10 text-center text-xs text-slate-400">
                                        Loading 10 parking bays...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {hubSlots.map((slot) => {
                                            const style = TYPE_STYLES[slot.slot_type?.toLowerCase()] || TYPE_STYLES.compact;
                                            return (
                                                <div
                                                    key={slot.id}
                                                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition ${slot.is_occupied
                                                        ? 'bg-rose-950/20 border-rose-500/30 opacity-75'
                                                        : 'bg-[#0B1222]/85 border-white/10 hover:border-[#F5B21B]/50'
                                                        }`}
                                                >
                                                    <div className="text-lg font-black font-mono text-white">
                                                        {slot.slot_number}
                                                    </div>

                                                    <span
                                                        className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${style.badge}`}
                                                    >
                                                        {style.label}
                                                    </span>

                                                    <div className="mt-2.5 flex items-center gap-1 text-xs font-bold">
                                                        {slot.is_occupied ? (
                                                            <span className="text-rose-400 inline-flex items-center gap-1">
                                                                <XCircle className="w-3.5 h-3.5" /> Occupied
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-400 inline-flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Open
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 pt-2 border-t border-white/10 w-full text-xs font-extrabold text-[#F5B21B]">
                                                        ₹{slot.hourly_rate}/hr
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

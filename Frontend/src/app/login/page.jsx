'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Mail,
    Lock,
    User,
    ShieldCheck,
    Car,
    ArrowRight,
    Eye,
    EyeOff,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const generateUuid = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });

const generateFallbackPin = (seed) => {
    let hash = 0;
    const str = String(seed || Date.now());
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return String(hash % 1000000).padStart(6, '0');
};

export default function LoginPage() {
    const [role, setRole] = useState('driver');
    const [isRegister, setIsRegister] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        localStorage.removeItem('parkease_user_role');
        localStorage.removeItem('parkease_client_id');
        localStorage.removeItem('parkease_user_pin');
        localStorage.removeItem('parkease_user_name');
        localStorage.removeItem('parkease_user_email');
        sessionStorage.clear();
    }, []);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            return setErrorMsg('Please enter a valid email address.');
        }
        if (!password || password.length < 4) {
            return setErrorMsg('Password must be at least 4 characters.');
        }

        setLoading(true);

        try {
            const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName.trim(),
                    email: cleanEmail,
                    password,
                    role,
                }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Backend server needs a restart (run node server.js on port 5001).');
            }

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            const userId = data.user?.id || generateUuid();
            const userPin = data.user?.pin || generateFallbackPin(userId);

            sessionStorage.setItem('parkease_user_email', data.user?.email || cleanEmail);
            sessionStorage.setItem('parkease_client_id', userId);
            sessionStorage.setItem('parkease_user_pin', userPin);
            sessionStorage.setItem('parkease_user_role', role);
            if (data.user?.name) {
                sessionStorage.setItem('parkease_user_name', data.user.name);
            }

            window.location.href = role === 'owner' ? '/owner' : '/';
        } catch (err) {
            if (err.message === 'Failed to fetch') {
                setErrorMsg('Cannot connect to backend API on port 5001. Make sure node server.js is running.');
            } else {
                setErrorMsg(err.message);
            }
            setLoading(false);
        }
    };

    const handleGuestAccess = () => {
        const clientId = generateUuid();
        sessionStorage.setItem('parkease_client_id', clientId);
        sessionStorage.setItem('parkease_user_pin', generateFallbackPin(clientId));
        sessionStorage.setItem('parkease_user_role', 'driver');
        sessionStorage.removeItem('parkease_user_email');
        sessionStorage.removeItem('parkease_user_name');
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-[#080F1E] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-[#F5B21B] selection:text-[#080F1E]">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-[#1D4ED8]/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[#F5B21B]/8 rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111E36] border border-[#1E3A5F] text-[11px] font-black uppercase tracking-wider text-[#F5B21B] mb-5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Smart Parking OS • Identity Gateway</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-[#F5B21B] text-[#080F1E] flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
                        P
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                            Park<span className="text-[#F5B21B]">Ease</span>
                        </h1>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                            Smart Parking OS
                        </span>
                    </div>
                </div>

                <p className="text-sm text-[#94A3B8] text-center mt-2 max-w-sm">
                    {role === 'driver'
                        ? 'Sign in or register to get your auto-generated 6-digit Gate PIN and book parking slots.'
                        : 'Authenticate to access facility occupancy telemetry, surge controls, and slot management.'}
                </p>

                <div className="w-full mt-7 p-1.5 rounded-2xl bg-[#0F192E] border border-[#1E293B] grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setRole('driver');
                            setErrorMsg('');
                        }}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${role === 'driver'
                            ? 'bg-[#F5B21B] text-[#080F1E] shadow-md'
                            : 'text-[#CBD5E1] hover:text-white hover:bg-[#16233D]'
                            }`}
                    >
                        <Car className="w-4 h-4" />
                        <span>Driver Access</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setRole('owner');
                            setErrorMsg('');
                        }}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${role === 'owner'
                            ? 'bg-[#F5B21B] text-[#080F1E] shadow-md'
                            : 'text-[#CBD5E1] hover:text-white hover:bg-[#16233D]'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Owner Portal</span>
                    </button>
                </div>

                <form
                    onSubmit={handleAuthSubmit}
                    className="w-full mt-5 p-6 sm:p-7 rounded-3xl bg-[#111C33] border border-[#1E2E4A] shadow-2xl space-y-4"
                >
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#091122] border border-[#1E293B]">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(false);
                                setErrorMsg('');
                            }}
                            className={`py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${!isRegister
                                ? 'bg-[#1E293B] text-white shadow-sm'
                                : 'text-[#64748B] hover:text-slate-300'
                                }`}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(true);
                                setErrorMsg('');
                            }}
                            className={`py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${isRegister
                                ? 'bg-[#1E293B] text-[#F5B21B] shadow-sm'
                                : 'text-[#64748B] hover:text-slate-300'
                                }`}
                        >
                            Register (New User)
                        </button>
                    </div>

                    {isRegister && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#CBD5E1] flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#F5B21B]" />
                                <span>Full Name</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Soumith Reddy"
                                className="w-full rounded-xl bg-[#091122] border border-[#1E293B] focus:border-[#F5B21B] focus:outline-none px-4 py-3 text-sm text-white placeholder-[#475569] transition"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="login-email"
                            className="text-xs font-bold text-[#CBD5E1] flex items-center justify-between"
                        >
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[#F5B21B]" />
                                <span>Email Address</span>
                            </span>
                            {role === 'driver' && (
                                <span className="text-[10px] font-semibold text-emerald-400">
                                    Auto-generates Gate PIN
                                </span>
                            )}
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errorMsg) setErrorMsg('');
                            }}
                            placeholder={role === 'owner' ? 'admin@parkease.io' : 'you@example.com'}
                            className="w-full rounded-xl bg-[#091122] border border-[#1E293B] focus:border-[#3B82F6] focus:outline-none px-4 py-3 text-sm text-white placeholder-[#475569] transition"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="login-password"
                            className="text-xs font-bold text-[#CBD5E1] flex items-center gap-1.5"
                        >
                            <Lock className="w-3.5 h-3.5 text-[#F5B21B]" />
                            <span>Password</span>
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                placeholder="••••••••"
                                className="w-full rounded-xl bg-[#091122] border border-[#1E293B] focus:border-[#3B82F6] focus:outline-none pl-4 pr-11 py-3 text-sm text-white placeholder-[#475569] transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition cursor-pointer"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-[0.99] cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#F5B21B]" />
                                <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                            </>
                        ) : (
                            <>
                                <span>
                                    {role === 'owner'
                                        ? isRegister
                                            ? 'Register & Open Owner Portal'
                                            : 'Login to Owner Portal'
                                        : isRegister
                                            ? 'Register & Get Gate PIN'
                                            : 'Login & Get Gate PIN'}
                                </span>
                                <ArrowRight className="w-4 h-4 text-[#FCD34D]" />
                            </>
                        )}
                    </button>

                    {role === 'driver' && (
                        <>
                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-white/10" />
                                <span className="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                                    or
                                </span>
                                <div className="flex-grow border-t border-white/10" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGuestAccess}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#091122] hover:bg-[#16233D] border border-[#1E293B] text-xs font-bold text-[#CBD5E1] hover:text-white transition cursor-pointer"
                            >
                                Continue as Guest (Quick Book)
                            </button>
                        </>
                    )}
                </form>

                <div className="mt-6 flex items-center gap-4 text-[11px] text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PostgreSQL & Redis Secured</span>
                    </span>
                    <span>•</span>
                    <Link href="/verify" className="text-[#94A3B8] hover:text-[#F5B21B] transition">
                        Gate Terminal →
                    </Link>
                </div>
            </div>
        </div>
    );
}

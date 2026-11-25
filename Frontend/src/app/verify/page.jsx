'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  KeyRound,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function VerifyGatePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [direction, setDirection] = useState('entry');
  const [mode, setMode] = useState('pin');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [qrInput, setQrInput] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    const role = sessionStorage.getItem('parkease_user_role');
    if (!role) {
      router.replace('/login');
      return;
    }

    const pin = sessionStorage.getItem('parkease_user_pin') || '';
    setSavedPin(pin);
    if (pin && pin.length === 6) {
      setDigits(pin.split(''));
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setDigits(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleFillSavedPin = () => {
    if (savedPin && savedPin.length === 6) {
      setDigits(savedPin.split(''));
      setResult(null);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const endpoint =
      direction === 'entry'
        ? `${API_BASE}/bookings/verify-entry`
        : `${API_BASE}/bookings/verify-exit`;

    let payload = {};
    if (mode === 'pin') {
      const gateCode = digits.join('');
      if (gateCode.length !== 6) {
        setLoading(false);
        return setResult({
          ok: false,
          message: 'Please enter all 6 digits of your Gate PIN.',
          time: new Date().toLocaleTimeString(),
        });
      }
      payload = { gateCode };
    } else {
      try {
        const parsed = JSON.parse(qrInput);
        payload = { bookingId: parsed.bookingId, qrHash: parsed.qrHash, gateCode: parsed.gatePin };
      } catch {
        setLoading(false);
        return setResult({
          ok: false,
          message: 'Invalid QR JSON payload.',
          time: new Date().toLocaleTimeString(),
        });
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({
          ok: false,
          message: data.error || 'Access denied.',
          time: new Date().toLocaleTimeString(),
        });
      } else {
        setResult({
          ok: true,
          message: data.message,
          slotNumber: data.slotNumber,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch {
      setResult({
        ok: false,
        message: 'Cannot reach Gate Controller API on port 5001.',
        time: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080F1E] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[480px] h-[480px] bg-[#1D4ED8]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/3 w-[420px] h-[420px] bg-[#F5B21B]/8 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-[#111E36] border border-[#F5B21B]/40 flex items-center justify-center text-[#F5B21B] mb-4 shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white text-center">
          Gate Access Terminal
        </h1>
        <p className="text-sm text-[#94A3B8] text-center mt-1.5">
          Scan your mobile QR pass or enter your 6-digit gate PIN.
        </p>

        <div className="w-full mt-7 p-1.5 rounded-2xl bg-[#0F192E] border border-[#1E293B] grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDirection('entry');
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${direction === 'entry'
              ? 'bg-[#F5B21B] text-[#080F1E] shadow-md'
              : 'text-[#CBD5E1] hover:text-white hover:bg-[#16233D]'
              }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Gate In (Entry)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDirection('exit');
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${direction === 'exit'
              ? 'bg-[#F5B21B] text-[#080F1E] shadow-md'
              : 'text-[#CBD5E1] hover:text-white hover:bg-[#16233D]'
              }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Gate Out (Exit)</span>
          </button>
        </div>

        <form
          onSubmit={handleVerify}
          className="w-full mt-5 p-6 rounded-3xl bg-[#111C33] border border-[#1E2E4A] shadow-2xl space-y-5"
        >
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#091122] border border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                setMode('qr');
                setResult(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${mode === 'qr'
                ? 'bg-[#1E293B] text-white'
                : 'text-[#64748B] hover:text-slate-300'
                }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#F5B21B]" />
              <span>Optical QR Scan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('pin');
                setResult(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${mode === 'pin'
                ? 'bg-[#1E293B] text-white'
                : 'text-[#64748B] hover:text-slate-300'
                }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#F5B21B]" />
              <span>6-Digit Gate PIN</span>
            </button>
          </div>

          {mode === 'pin' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Enter your 6-digit access PIN</span>
                {savedPin && (
                  <button
                    type="button"
                    onClick={handleFillSavedPin}
                    className="inline-flex items-center gap-1 text-[#F5B21B] hover:text-[#FCD34D] font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill ({savedPin})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-full h-12 sm:h-14 rounded-xl bg-[#091122] border border-[#1E293B] focus:border-[#F5B21B] focus:outline-none text-center text-lg sm:text-xl font-black font-mono text-white transition"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#CBD5E1] block">
                Paste QR Pass Payload
              </label>
              <textarea
                rows={3}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder='{"bookingId":"...","qrHash":"..."}'
                className="w-full rounded-xl bg-[#091122] border border-[#1E293B] focus:border-[#F5B21B] focus:outline-none p-3 text-xs font-mono text-white placeholder-[#475569]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F5B21B]" />
                <span>Verifying Gate Pass...</span>
              </>
            ) : (
              <span>
                {direction === 'entry' ? 'Verify PIN & Open Entry Gate' : 'Verify PIN & Complete Exit'}
              </span>
            )}
          </button>
        </form>

        {result && (
          <div
            className={`w-full mt-5 p-4 rounded-2xl border flex items-start gap-3 ${result.ok
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
          >
            {result.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">
                  {result.ok ? 'Access Granted' : 'Access Denied'}
                </span>
                <span className="text-[11px] font-mono opacity-75">{result.time}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-1">{result.message}</p>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reservation Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

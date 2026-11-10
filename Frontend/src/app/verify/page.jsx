"use client";

import { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function VerificationPage() {
    const [tokenInput, setTokenInput] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const parsed = JSON.parse(tokenInput);
            const res = await fetch(`${API_BASE}/bookings/verify-entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: parsed.bookingId,
                    qrHash: parsed.qrHash,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message);

            setStatus({ success: true, message: data.message });
        } catch (err) {
            setStatus({ success: false, message: err.message || 'Invalid QR Token format' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-6">
            <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <h1 className="text-2xl font-bold text-slate-900">Gate Entry Verification</h1>
                <p className="text-sm text-slate-500">Scan or input customer QR token payload[span_1](start_span)[span_1](end_span).</p>
            </div>

            <form onSubmit={handleVerify} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                        QR Payload (JSON string)
                    </label>
                    <textarea
                        rows={4}
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder='{"bookingId": "...", "qrHash": "..."}'
                        className="w-full border rounded-lg p-2.5 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Authorize Entry'}
                </button>
            </form>

            {status && (
                <div
                    className={`p-4 rounded-xl flex items-start gap-3 border ${status.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                >
                    {status.success ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    ) : (
                        <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{status.message}</span>
                </div>
            )}
        </div>
    );
}

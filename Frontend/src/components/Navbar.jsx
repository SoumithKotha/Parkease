"use client";

import Link from 'next/link';
import { Car, QrCode, LayoutDashboard, CalendarCheck } from 'lucide-react';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                    <Car className="w-6 h-6" />
                    <span>ParkEase</span>
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                        <CalendarCheck className="w-4 h-4" /> Reserve
                    </Link>
                    <Link href="/owner" className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                        <LayoutDashboard className="w-4 h-4" /> Owner Portal
                    </Link>
                    <Link href="/verify" className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                        <QrCode className="w-4 h-4" /> Verify QR
                    </Link>
                </nav>
            </div>
        </header>
    );
}


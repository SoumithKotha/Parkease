'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, ShieldCheck, Building2, KeyRound, User, LogOut } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userPin, setUserPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePasses, setActivePasses] = useState([]);

  useEffect(() => {
    const role = sessionStorage.getItem('parkease_user_role');
    const name = sessionStorage.getItem('parkease_user_name');
    const pin = sessionStorage.getItem('parkease_user_pin');
    const clientId = sessionStorage.getItem('parkease_client_id');

    setIsLoggedIn(Boolean(role));
    setUserName(name || (role === 'owner' ? 'Hub Owner' : 'Customer'));
    setUserPin(pin || '');

    if (clientId && pathname !== '/login') {
      fetch(`${API_BASE}/bookings/user/${clientId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.bookings) setActivePasses(data.bookings);
        })
        .catch(() => { });
    }
  }, [pathname]);

  const handleSignOut = () => {
    sessionStorage.removeItem('parkease_user_role');
    sessionStorage.removeItem('parkease_client_id');
    sessionStorage.removeItem('parkease_user_name');
    sessionStorage.removeItem('parkease_user_email');
    sessionStorage.removeItem('parkease_user_pin');
    setIsLoggedIn(false);
    setActivePasses([]);
    router.replace('/login');
  };

  if (pathname === '/login') return null;

  const navItems = [
    { href: '/', label: 'Book Parking', icon: Calendar },
    { href: '/verify', label: 'Gate Access', icon: ShieldCheck },
    { href: '/owner', label: 'Owner Portal', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1222]/95 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0B1222] border border-[#F5B21B]/50 flex items-center justify-center font-black text-white">
            P
          </div>
          <div className="leading-none">
            <span className="text-lg font-black text-white">Park</span>
            <span className="text-lg font-black text-[#F5B21B]">Ease</span>
            <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
              Smart Parking OS
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2 bg-[#132A4F]/70 p-1 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition ${active
                    ? 'bg-[#F5B21B] text-[#0B1222] shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {activePasses.length > 0 && (
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <span>{activePasses.length} Active {activePasses.length === 1 ? 'Pass' : 'Passes'}</span>
            </Link>
          )}

          {userPin && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132A4F] border border-[#F5B21B]/40 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-[#F5B21B]" />
              <span className="text-slate-400 font-semibold">PIN</span>
              <span className="font-mono font-black text-white tracking-wider">{userPin}</span>
            </div>
          )}

          {isLoggedIn && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200">
                <User className="w-3.5 h-3.5 text-[#F5B21B]" />
                <span>{userName}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

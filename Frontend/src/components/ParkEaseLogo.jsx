'use client';

export default function ParkEaseLogo({ size = 'default', showTagline = false, className = '' }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconDim = isSmall ? 34 : isLarge ? 48 : 40;
  const textSize = isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: iconDim, height: iconDim }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(245,178,27,0.35)]"
        >
          <defs>
            <linearGradient id="peBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#132A4F" />
              <stop offset="100%" stopColor="#0B1222" />
            </linearGradient>

            <linearGradient id="peGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F5B21B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <filter id="peGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#peBgGrad)"
            stroke="#1D4ED8"
            strokeWidth="3.5"
          />
          <rect
            x="7"
            y="7"
            width="86"
            height="86"
            rx="21"
            fill="none"
            stroke="#F5B21B"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          <path
            d="M 28 72 L 28 26 L 52 26 C 63 26 70 32 70 41 C 70 50 63 56 52 56 L 41 56 L 41 72 Z M 41 44 L 51 44 C 56 44 59 42 59 41 C 59 39 56 37 51 37 L 41 37 Z"
            fill="#F8FAFC"
          />

          <g transform="translate(38, 48) scale(0.65)">
            <path
              d="M 8 20 C 8 18 10 16 13 14 L 18 8 C 20 5 23 4 27 4 L 41 4 C 45 4 48 5 50 8 L 55 14 C 58 16 60 18 60 20 L 62 26 C 63 28 61 30 59 30 L 58 30 C 58 34 55 37 51 37 C 47 37 44 34 44 30 L 24 30 C 24 34 21 37 17 37 C 13 37 10 34 10 30 L 9 30 C 7 30 5 28 6 26 Z"
              fill="url(#peGoldGrad)"
              filter="url(#peGlow)"
            />
            <path
              d="M 20 14 L 27 8 L 41 8 L 48 14 Z"
              fill="#0B1222"
              opacity="0.85"
            />
            <circle cx="17" cy="30" r="4.5" fill="#0B1222" stroke="#FDE68A" strokeWidth="1.5" />
            <circle cx="51" cy="30" r="4.5" fill="#0B1222" stroke="#FDE68A" strokeWidth="1.5" />
            <ellipse cx="61" cy="22" rx="2" ry="1.2" fill="#FEF08A" />
          </g>

          <g transform="translate(62, 8) scale(0.6)">
            <path
              d="M 18 4 C 11.4 4 6 9.4 6 16 C 6 24.5 18 36 18 36 C 18 36 30 24.5 30 16 C 30 9.4 24.6 4 18 4 Z"
              fill="url(#peGoldGrad)"
              stroke="#0B1222"
              strokeWidth="1.8"
            />
            <circle cx="18" cy="15" r="4" fill="#0B1222" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className={`font-black tracking-tight leading-none ${textSize}`}>
          <span className="text-[#F8FAFC]">Park</span>
          <span className="text-[#F5B21B] drop-shadow-[0_0_12px_rgba(245,178,27,0.4)]">Ease</span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
            Smart Parking OS
          </span>
        )}
      </div>
    </div>
  );
}

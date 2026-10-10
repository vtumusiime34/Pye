import React, { useId } from 'react';

export interface PyeLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  showAppixTag?: boolean;
  variant?: 'full' | 'icon' | 'badge';
  onClick?: () => void;
}

export const PyeLogo: React.FC<PyeLogoProps> = ({
  size = 38,
  className = '',
  showText = false,
  showAppixTag = true,
  variant = 'full',
  onClick,
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 38;
  const rawId = useId();
  const id = `pye_${rawId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const emblem = (
    <div
      className="relative flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
      style={{ width: numericSize, height: numericSize }}
    >
      {/* Ambient Cosmic Backlight Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-50 pointer-events-none transition-opacity duration-300 group-hover:opacity-75"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 0, 122, 0.65) 0%, rgba(255, 85, 0, 0.45) 55%, transparent 80%)',
        }}
      />

      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_2px_14px_rgba(255,0,122,0.4)]"
      >
        <defs>
          {/* Main Spectrum Gradient: Neon Magenta -> Vivid Pink -> Hot Coral -> Sunset Gold */}
          <linearGradient id={`${id}_spectrum`} x1="10%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="35%" stopColor="#FF1493" />
            <stop offset="70%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>

          {/* Glowing Orbit Gradient */}
          <linearGradient id={`${id}_orbit`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="50%" stopColor="#FF007A" />
            <stop offset="100%" stopColor="#7928CA" />
          </linearGradient>

          {/* Accent Satellite Glow Gradient */}
          <linearGradient id={`${id}_satellite`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFD200" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>

          {/* Play Icon Gradient */}
          <linearGradient id={`${id}_play`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFD1E6" />
          </linearGradient>

          {/* Stem Drop Glow */}
          <filter id={`${id}_glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Cosmic Planetary Orbit Ring */}
        <ellipse
          cx="60"
          cy="60"
          rx="50"
          ry="32"
          transform="rotate(-28 60 60)"
          fill="none"
          stroke={`url(#${id}_orbit)`}
          strokeWidth="4"
          strokeDasharray="210 50"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* 2. Celestial Satellite Node (Quantum Pulsar) on the Orbit */}
        <circle
          cx="96"
          cy="38"
          r="6.5"
          fill={`url(#${id}_satellite)`}
          filter={`url(#${id}_glow)`}
        />
        <circle cx="96" cy="38" r="2.8" fill="#FFFFFF" />

        {/* 3. The Iconic P Vertical Stem with Rounded Terminals */}
        <path
          d="M 42 26 L 42 94"
          stroke={`url(#${id}_spectrum)`}
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* 4. The Iconic P Upper Loop Bowl */}
        <path
          d="M 42 26 C 62 26, 84 32, 84 50 C 84 68, 62 74, 42 74"
          fill="none"
          stroke={`url(#${id}_spectrum)`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Center Play Action Triangle (Media Transmission Node) */}
        <path
          d="M 54 41.5 L 68 50 L 54 58.5 Z"
          fill={`url(#${id}_spectrum)`}
          stroke={`url(#${id}_spectrum)`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 6. High-Luminance Specular Reflection inside Play Symbol */}
        <polygon
          points="55,43.5 63,48.5 55,50"
          fill="#FFFFFF"
          fillOpacity="0.7"
        />
      </svg>
    </div>
  );

  const content = (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        variant === 'badge'
          ? 'px-3 py-1.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md shadow-lg shadow-black/40'
          : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {emblem}

      {/* Brand Typography & APPIX Submark */}
      {showText && (
        <div className="flex flex-col text-left leading-none tracking-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-wider text-white font-display uppercase drop-shadow-[0_2px_8px_rgba(255,0,122,0.3)]">
              PYE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-[#FF007A]/25 to-[#FFA000]/25 text-[#FFA000] border border-[#FFA000]/30 font-mono">
              UNIVERSE
            </span>
          </div>
          {showAppixTag && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">
                BY
              </span>
              <span className="text-[9px] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000]">
                APPIX
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return content;
};

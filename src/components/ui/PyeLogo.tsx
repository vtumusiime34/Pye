import React from 'react';

interface PyeLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export const PyeLogo: React.FC<PyeLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Official PYE Logo Gradient: Magenta to Hot Orange */}
          <linearGradient id="pyeMainGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="45%" stopColor="#FF1493" />
            <stop offset="75%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>

          <linearGradient id="pyeDotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1493" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring with Gap in Top-Right */}
        <path
          d="M 68 22 A 38 38 0 1 0 88 50"
          fill="none"
          stroke="url(#pyeMainGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
        />

        {/* Orbiting Satellite Dot in the gap */}
        <circle cx="78" cy="28" r="5" fill="url(#pyeDotGrad)" />

        {/* Stylized Speech-Bubble 'P' shape */}
        <path
          d="M 37 31 
             C 37 28, 41 27, 50 27 
             C 61 27, 68 33, 68 44 
             C 68 53, 61 59, 51 59 
             L 45 59 
             L 37 68 
             L 37 31 Z"
          fill="none"
          stroke="url(#pyeMainGrad)"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Play Triangle Inside the 'P' */}
        <path
          d="M 46 38.5 
             L 57 44.5 
             L 46 50.5 
             Z"
          fill="url(#pyeMainGrad)"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className="text-base font-black tracking-wider text-white font-display uppercase">
            PYE
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF007A] to-[#FFA000]">
            Social Universe
          </span>
        </div>
      )}
    </div>
  );
};

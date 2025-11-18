import React from 'react';

const Logo = () => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Core Glow Background */}
      <div className="absolute inset-0 bg-accent-primary/40 blur-xl rounded-full animate-pulse"></div>
      
      {/* Rotating Outer Ring (SVG) */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
        <defs>
          <linearGradient id="paint0_linear" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6E3FF3"/>
            <stop offset="1" stopColor="#B156FF" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Counter-Rotating Geometric Shape */}
      <div className="absolute inset-0 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
        <div className="w-6 h-6 border border-accent-secondary/60 rounded transform rotate-45 backdrop-blur-sm"></div>
      </div>

      {/* Pulsing Central Core */}
      <div className="relative w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-ping opacity-75"></div>
      <div className="absolute w-1.5 h-1.5 bg-white rounded-full"></div>
    </div>
  );
};

export default Logo;
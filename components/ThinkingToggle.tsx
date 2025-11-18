import React from 'react';

interface ThinkingToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const ThinkingToggle: React.FC<ThinkingToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium tracking-wide transition-colors duration-300 ${isEnabled ? 'text-accent-secondary shadow-accent-secondary drop-shadow-md' : 'text-text-muted'}`}>
        Thinking Mode
      </span>
      
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full p-1 transition-all duration-500 ease-out border ${
          isEnabled 
            ? 'bg-space-900 border-accent-secondary shadow-[0_0_15px_rgba(177,86,255,0.4)]' 
            : 'bg-space-950 border-accent-muted'
        }`}
      >
        {/* Track Glow */}
        {isEnabled && (
            <div className="absolute inset-0 rounded-full bg-accent-secondary/10 blur-sm"></div>
        )}

        {/* The Knob */}
        <div 
          className={`relative w-5 h-5 rounded-full shadow-md transform transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center ${
            isEnabled ? 'translate-x-7 bg-accent-secondary' : 'translate-x-0 bg-text-muted'
          }`}
        >
            {isEnabled && (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            )}
        </div>
      </button>
    </div>
  );
};

export default ThinkingToggle;
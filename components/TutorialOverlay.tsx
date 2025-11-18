import React, { useEffect, useState, useRef } from 'react';

interface TutorialOverlayProps {
  step: number;
  targetId?: string;
  title: string;
  message: string;
  onNext?: () => void;
  onSkip: () => void;
  isModal?: boolean; // For the welcome screen
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  step,
  targetId, 
  title, 
  message, 
  onNext, 
  onSkip, 
  isModal 
}) => {
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref to track current visibility to avoid stale closures
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (isModal) {
      setPosition(null);
      // Slight delay for enter animation
      const timer = setTimeout(() => {
        setIsVisible(true);
        isVisibleRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }

    let animationFrameId: number;

    // Optimized loop using requestAnimationFrame instead of heavy scroll listeners
    const updateLoop = () => {
      if (targetId) {
        const el = document.getElementById(targetId);
        
        if (el) {
          const rect = el.getBoundingClientRect();
          
          // Update state only if position changed significantly
          setPosition(prev => {
            if (prev && 
                Math.abs(prev.top - rect.top) < 0.5 && 
                Math.abs(prev.left - rect.left) < 0.5 &&
                Math.abs(prev.width - rect.width) < 0.5 &&
                Math.abs(prev.height - rect.height) < 0.5
            ) {
              return prev;
            }
            return {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            };
          });
          
          if (!isVisibleRef.current) {
              setIsVisible(true);
              isVisibleRef.current = true;
          }
        } else {
          // Target not found (e.g. scrolled out of view or view changed)
          if (isVisibleRef.current) {
              setIsVisible(false);
              isVisibleRef.current = false;
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    // Start the loop
    updateLoop();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetId, isModal]);

  if (!isVisible && !isModal) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none font-sans">
      {/* Modal Backdrop: Full blur ONLY for the welcome modal */}
      {isModal && (
        <div className={`absolute inset-0 bg-space-950/80 backdrop-blur-sm transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
      )}

      {/* Modal: System Welcome */}
      {isModal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto p-4">
           <div className="relative max-w-lg w-full bg-space-900/95 border border-white/10 p-10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up">
              {/* Decorative Background Gradients */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-8 relative flex items-center justify-center">
                      <div className="absolute inset-0 border border-accent-primary/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-2 border border-white/10 rounded-full"></div>
                      <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                  </div>

                  <h2 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">{title}</h2>
                  <p className="text-text-muted mb-10 text-sm leading-relaxed max-w-xs mx-auto">{message}</p>
                  
                  <div className="flex gap-4 justify-center items-center">
                    <button 
                      onClick={onSkip}
                      className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                    >
                      Skip Intro
                    </button>
                    <button 
                      onClick={onNext}
                      className="group relative px-8 py-3 bg-white text-space-950 rounded-lg font-bold text-sm hover:bg-accent-primary hover:text-white transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10">Begin Orientation</span>
                      <div className="absolute inset-0 bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Spotlight Overlay for Interactive Steps */}
      {!isModal && position && (
        <>
            {/* Spotlight Mask 
                Uses a massive box-shadow to dim the surroundings while leaving the target clear.
                This ensures the target element is NOT blurry and fully interactive. 
            */}
            <div 
                className={`absolute transition-all duration-300 ease-out pointer-events-none z-40 rounded-xl ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    top: position.top - 8,
                    left: position.left - 8,
                    width: position.width + 16,
                    height: position.height + 16,
                    boxShadow: '0 0 0 9999px rgba(5, 3, 18, 0.85)' // The scrim
                }}
            />

            {/* Target Visuals (Brackets & Glow) */}
            <div 
                className={`absolute transition-all duration-300 ease-out pointer-events-none z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    top: position.top - 8,
                    left: position.left - 8,
                    width: position.width + 16,
                    height: position.height + 16,
                }}
            >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent-primary rounded-tl-md"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent-primary rounded-tr-md"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent-primary rounded-bl-md"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent-primary rounded-br-md"></div>
                
                {/* Active pulse glow */}
                <div className="absolute inset-0 border border-accent-primary/20 rounded-xl animate-pulse"></div>
            </div>

            {/* Tooltip Card */}
            <div 
                className="absolute pointer-events-auto transition-all duration-300 ease-out z-50"
                style={{
                    top: position.top + (position.height / 2) - 60, 
                    left: position.left + position.width + 24, // Positioned to the right of the highlight
                }}
            >
               {/* Connecting Line */}
               <div className="absolute top-1/2 -left-6 w-6 h-px bg-gradient-to-r from-accent-primary/50 to-accent-primary/10"></div>
               <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_10px_rgba(110,63,243,1)]"></div>

                <div className="w-72 bg-space-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl relative animate-fade-in overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-accent-secondary uppercase tracking-[0.2em]">Step {step}</span>
                            <button onClick={onSkip} className="text-white/20 hover:text-white transition-colors" title="End Tour">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-0">
                            {message}
                        </p>
                        
                        {onNext && (
                             <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={onNext}
                                    className="text-xs font-bold text-white hover:text-accent-primary transition-colors flex items-center gap-1"
                                >
                                    Next <span className="text-lg leading-none">&rsaquo;</span>
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default TutorialOverlay;
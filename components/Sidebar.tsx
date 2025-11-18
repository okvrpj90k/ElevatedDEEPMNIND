import React, { useEffect } from 'react';
import { AppView } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ 
  view, 
  current, 
  label, 
  icon, 
  onClick
}: { 
  view: AppView; 
  current: AppView; 
  label: string; 
  icon: React.ReactNode; 
  onClick: (v: AppView) => void;
}) => {
  const isActive = current === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`
        group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
        transition-all duration-300 ease-out overflow-hidden
        ${isActive 
          ? 'bg-space-800/50 text-white shadow-lg shadow-accent-primary/10' 
          : 'text-text-muted hover:bg-space-800/30 hover:text-white'}
      `}
    >
      {/* Active/Hover Indicator Line */}
      <div 
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-out
          ${isActive 
            ? 'h-8 bg-accent-primary opacity-100' 
            : 'h-0 bg-accent-secondary opacity-0 group-hover:h-4 group-hover:opacity-50'}
        `} 
      />

      {/* Background Flash on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Icon */}
      <span className={`
        relative z-10 transition-all duration-300 group-hover:scale-110
        ${isActive 
          ? 'text-accent-primary scale-105' 
          : 'text-text-muted group-hover:text-accent-primary'}
      `}>
        {icon}
      </span>

      {/* Label */}
      <span className={`
        relative z-10 font-medium text-sm tracking-wide transition-all duration-300
        ${isActive ? 'translate-x-1 font-semibold' : 'group-hover:translate-x-1'}
      `}>
        {label}
      </span>
      
      {/* Active Glow Dot */}
      {isActive && (
         <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(110,63,243,0.8)] animate-pulse" />
      )}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  
  // Lock body scroll on mobile when menu is open
  useEffect(() => {
    if (window.innerWidth < 768) {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 h-full w-64 bg-space-950 border-r border-accent-muted flex flex-col py-6 px-3 shrink-0
        transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl md:shadow-none
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header Section */}
        <div className="mb-8 px-4">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <Logo />
                    <h1 className="font-display font-bold text-lg text-text-main tracking-tight leading-tight">Elevated<br/>DeepMind</h1>
                </div>
                
                {/* Mobile Close Button */}
                <button 
                    onClick={onClose}
                    className="md:hidden p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Powered by Gemini 3 Badge */}
            <div className="relative group cursor-default select-none">
                {/* Ambient Glow Layer */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/50 to-accent-secondary/50 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-700"></div>
                
                {/* Badge Surface */}
                <div className="relative flex items-center justify-between bg-space-900/80 border border-accent-muted/40 rounded-lg p-3 overflow-hidden backdrop-blur-sm transition-colors duration-300 hover:border-accent-primary/30">
                    
                    {/* Text Info */}
                    <div className="flex flex-col z-10">
                        <span className="text-[9px] uppercase tracking-widest text-text-muted font-medium leading-none mb-1.5">Powered by</span>
                        <span className="font-display font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-secondary to-accent-primary">
                            Gemini 3
                        </span>
                    </div>

                    {/* Animated Model Icon */}
                    <div className="relative w-7 h-7 flex items-center justify-center z-10 bg-space-950 rounded-full border border-accent-muted/30 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-accent-secondary animate-pulse-slow">
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                        </svg>
                        {/* Subtle Spinner Ring */}
                        <div className="absolute inset-0 rounded-full border border-accent-primary/20 border-t-accent-primary/60 animate-[spin_4s_linear_infinite]"></div>
                    </div>

                    {/* Sliding Shimmer Effect */}
                    <div className="absolute top-0 -left-[100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[200%] pointer-events-none"></div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 z-20 bg-space-950/95 backdrop-blur-sm py-2 text-xs font-bold text-text-muted uppercase tracking-wider px-4 mb-2 border-b border-transparent">
            Workspace
            </div>
            <NavItem 
            view={AppView.DASHBOARD} 
            current={currentView} 
            label="Dashboard" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>}
            />
            <NavItem 
            view={AppView.UPLOAD} 
            current={currentView} 
            label="Upload & Input" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>}
            />

            <div className="sticky top-0 z-20 bg-space-950/95 backdrop-blur-sm py-2 mt-4 text-xs font-bold text-text-muted uppercase tracking-wider px-4 mb-2 border-b border-transparent">
            Learn
            </div>
            <NavItem 
            view={AppView.YOUTUBE} 
            current={currentView} 
            label="YouTube Analyzer" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>}
            />
            <NavItem 
            view={AppView.STUDY_CHAT} 
            current={currentView} 
            label="Study Chat" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>}
            />
            <NavItem 
            view={AppView.VOICE} 
            current={currentView} 
            label="Voice Companion" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>}
            />
            <NavItem 
            view={AppView.FLASHCARDS} 
            current={currentView} 
            label="Flashcards" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="m9 10 2 2 4-4"/></svg>}
            />
            <NavItem 
            view={AppView.QUIZ} 
            current={currentView} 
            label="Quizzes" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>}
            />

            <div className="sticky top-0 z-20 bg-space-950/95 backdrop-blur-sm py-2 mt-4 text-xs font-bold text-text-muted uppercase tracking-wider px-4 mb-2 border-b border-transparent">
            Research
            </div>
            <NavItem 
            view={AppView.NOTES} 
            current={currentView} 
            label="Explore Web" 
            onClick={onChangeView}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
            />
        </div>

        <div className="px-4 py-4 border-t border-accent-muted bg-space-950 z-20">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-space-800 flex items-center justify-center text-xs text-text-muted border border-accent-muted">
                USR
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-text-main">Student</span>
                <span className="text-xs text-text-muted">Pro Plan</span>
            </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
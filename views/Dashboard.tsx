import React from 'react';
import { AppView } from '../types';
import { useStudy } from '../context/StudyContext';

const StatCard = ({ label, value, subtext, icon, color }: { label: string; value: string; subtext: string, icon: React.ReactNode, color: string }) => (
  <div className="relative overflow-hidden rounded-2xl glass-panel p-6 group transition-all duration-300 hover:translate-y-[-2px]">
    <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-20`} style={{ background: color }}></div>
    
    <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-space-950/50 border border-white/5 text-white shadow-inner`}>
            {icon}
        </div>
        {/* Mini graph visualization decoration */}
        <div className="flex items-end gap-1 h-8 opacity-30">
             <div className="w-1 bg-current h-3 rounded-t"></div>
             <div className="w-1 bg-current h-5 rounded-t"></div>
             <div className="w-1 bg-current h-8 rounded-t"></div>
             <div className="w-1 bg-current h-4 rounded-t"></div>
        </div>
    </div>
    
    <div className="relative z-10">
        <div className="text-3xl font-display font-bold text-text-main mb-1 tracking-tight">{value}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{label}</div>
        <div className="text-xs text-text-muted/70 font-medium">{subtext}</div>
    </div>
  </div>
);

const ActionCard = ({ title, desc, onClick, icon, gradient }: { title: string; desc: string; onClick: () => void; icon: React.ReactNode, gradient: string }) => (
  <button onClick={onClick} className="relative w-full h-full text-left overflow-hidden rounded-2xl glass-panel p-6 group transition-all duration-300 hover:border-accent-primary/40">
    {/* Hover Gradient */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`}></div>
    
    <div className="relative z-10 flex flex-col h-full">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-space-800 to-space-950 border border-white/10 flex items-center justify-center mb-4 text-text-main shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-lg font-display font-bold text-text-main mb-2 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed group-hover:text-text-main/80 transition-colors">{desc}</p>
        
        <div className="mt-auto pt-4 flex items-center text-xs font-bold uppercase tracking-widest text-accent-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            Launch <span className="ml-2">&rarr;</span>
        </div>
    </div>
  </button>
);

const Dashboard: React.FC<{ onChangeView: (v: AppView) => void }> = ({ onChangeView }) => {
  const { stats, recentActivity, materials } = useStudy();
  const hasActivity = recentActivity.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in h-full overflow-y-auto" style={{ transform: 'translate3d(0,0,0)' }}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-text-muted max-w-xl text-sm md:text-base">
              Your personal cognitive command center. Review metrics and launch study protocols.
            </p>
        </div>
        <div className="text-left md:text-right">
             <div className="text-xs font-mono text-accent-secondary mb-1">SYSTEM STATUS</div>
             <div className="flex items-center md:justify-end gap-2 text-sm font-medium text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Gemini 3 Online
             </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <StatCard 
            label="Active Streak" 
            value={`${stats.streakDays}`} 
            subtext="Consistent daily activity"
            color="#6E3FF3"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard 
            label="Cards Mastered" 
            value={stats.cardsReviewed.toString()} 
            subtext="Total flashcards reviewed"
            color="#00F0FF"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard 
            label="Performance" 
            value={stats.quizzesTaken > 0 ? `${Math.round(stats.quizAverage)}%` : "N/A"} 
            subtext="Average quiz score" 
            color="#B156FF"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold text-text-main mb-6 flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-accent-primary rounded-full"></span>
           Quick Protocols
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ActionCard 
            title="Upload Data" 
            desc="Ingest PDFs, images, or text for processing." 
            onClick={() => onChangeView(AppView.UPLOAD)}
            gradient="from-accent-primary to-accent-secondary"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>}
          />
          <ActionCard 
            title="YouTube Analysis" 
            desc="Transcribe and summarize video content." 
            onClick={() => onChangeView(AppView.YOUTUBE)}
            gradient="from-red-600 to-orange-600"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
           <ActionCard 
            title="Voice Companion" 
            desc="Real-time study conversation with AI." 
            onClick={() => onChangeView(AppView.VOICE)}
            gradient="from-emerald-500 to-teal-500"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>}
          />
          <ActionCard 
            title="Web Explorer" 
            desc="Grounded search for external facts." 
            onClick={() => onChangeView(AppView.NOTES)}
            gradient="from-blue-500 to-indigo-500"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-2xl p-1">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
             <h3 className="text-lg font-display font-bold text-text-main">Activity Log</h3>
             <button className="text-xs text-accent-secondary hover:text-accent-primary transition-colors uppercase font-bold tracking-wider">View All</button>
        </div>
        <div className="p-2">
            {hasActivity ? (
                <ul className="space-y-1">
                {recentActivity.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-4 hover:bg-space-800/40 rounded-xl transition-colors group">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                                item.type === 'Upload' ? 'bg-accent-primary' :
                                item.type === 'Quiz' ? 'bg-accent-secondary' :
                                item.type === 'Review' ? 'bg-accent-cyan' : 'bg-text-muted'
                            }`}></div>
                            <div className="min-w-0 flex-1">
                                <div className="text-text-main font-medium text-sm truncate group-hover:text-white transition-colors">{item.title}</div>
                                <div className="text-xs text-text-muted font-mono mt-0.5">{new Date(item.timestamp).toLocaleTimeString()} &middot; {new Date(item.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-space-950 border border-white/10 text-text-muted uppercase tracking-wider shadow-sm hidden md:inline-block">
                            {item.type}
                        </span>
                    </li>
                ))}
                </ul>
            ) : (
                <div className="text-center py-12 text-text-muted/60">
                    <p className="text-sm">No signals detected.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import UploadCenter from './views/UploadCenter';
import StudyChat from './views/StudyChat';
import Flashcards from './views/Flashcards';
import WebExplorer from './views/WebExplorer';
import VoiceCompanion from './views/VoiceCompanion';
import Quiz from './views/Quiz';
import YouTubeAnalyzer from './views/YouTubeAnalyzer';
import { StudyProvider, useStudy } from './context/StudyContext';
import { AppView } from './types';

const MainContent = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { materials, addMaterial } = useStudy();
  
  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const handleMaterialAdded = (m: any) => {
    addMaterial(m);
    // Navigation logic could be added here if we want to auto-redirect after upload
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={handleViewChange} />;
      case AppView.UPLOAD:
        return <UploadCenter onAddMaterial={handleMaterialAdded} />;
      case AppView.STUDY_CHAT:
        return <StudyChat materials={materials} />;
      case AppView.FLASHCARDS:
        return <Flashcards materials={materials} />;
      case AppView.QUIZ:
        return <Quiz materials={materials} />;
      case AppView.NOTES: 
        return <WebExplorer />;
      case AppView.VOICE:
        return <VoiceCompanion />;
      case AppView.YOUTUBE:
        return <YouTubeAnalyzer />;
      default:
        return <Dashboard onChangeView={handleViewChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-space-950 text-text-main overflow-hidden font-sans selection:bg-accent-primary/30 selection:text-accent-primary">
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#150A33] via-space-950 to-space-950">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-space-950/90 backdrop-blur-md border-b border-white/5 shrink-0 z-30 relative">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Open Menu"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-display font-bold text-white tracking-tight">Elevated DeepMind</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary p-[1px] shadow-sm">
                <div className="w-full h-full rounded-full bg-space-950 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
            </div>
        </div>

        <div className="relative z-10 flex-1 h-full overflow-hidden">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
};

export default App;
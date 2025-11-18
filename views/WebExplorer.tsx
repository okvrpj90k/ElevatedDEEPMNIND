import React, { useState } from 'react';
import { searchWeb } from '../services/geminiService';
import { WebSearchResult } from '../types';
import ThinkingToggle from '../components/ThinkingToggle';

const WebExplorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setChunks([]);

    try {
      const response = await searchWeb(query, isThinking);
      setResult(response.text || "No text returned.");
      setChunks(response.chunks || []);
    } catch (err) {
      console.error(err);
      setResult("Error performing search.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-space-950">
       {/* Browser Top Bar */}
       <div className="p-4 md:p-6 border-b border-white/5 bg-space-950 sticky top-0 z-10">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                <span className="ml-2 md:ml-3 text-xs md:text-sm font-bold text-text-muted uppercase tracking-widest">Neural Web Browser</span>
            </div>
            <ThinkingToggle isEnabled={isThinking} onToggle={() => setIsThinking(!isThinking)} />
         </div>
         
         <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-md"></div>
            <div className="relative flex items-center bg-space-900 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent-primary/50 transition-colors">
                <div className="pl-4 text-text-muted hidden md:block">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search query..."
                className="w-full bg-transparent border-none px-4 py-3 md:py-4 text-text-main focus:outline-none placeholder:text-text-muted/30 font-medium text-sm md:text-base"
                />
                <button 
                type="submit"
                disabled={isProcessing}
                className="px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white text-sm font-bold border-l border-white/10 transition-colors"
                >
                {isProcessing ? 'Searching...' : 'Enter'}
                </button>
            </div>
         </form>
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ transform: 'translate3d(0,0,0)' }}>
          {isProcessing && (
             <div className="flex flex-col gap-6 animate-pulse max-w-4xl mx-auto">
               <div className="h-32 bg-space-900 rounded-2xl w-full"></div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="h-20 bg-space-900 rounded-xl"></div>
                   <div className="h-20 bg-space-900 rounded-xl"></div>
               </div>
             </div>
          )}

          {!isProcessing && result && (
            <div className="animate-slide-up max-w-4xl mx-auto">
              {/* Main Answer Card */}
              <div className="glass-panel rounded-2xl p-4 md:p-8 mb-6 md:mb-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Live Data
                    </div>
                 </div>
                 
                 <div className="prose prose-invert prose-lg max-w-none">
                   <p className="leading-relaxed whitespace-pre-wrap text-text-main/90 text-sm md:text-base">{result}</p>
                 </div>
              </div>

              {/* Citations */}
              {chunks.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 pl-1">Source Citations</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {chunks.map((chunk, i) => (
                       chunk.web ? (
                         <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-space-900 border border-white/5 hover:border-accent-primary/50 rounded-xl p-4 md:p-5 transition-all hover:-translate-y-1 group">
                           <h4 className="font-bold text-white truncate group-hover:text-accent-primary mb-1 text-sm md:text-base">{chunk.web.title}</h4>
                           <p className="text-xs text-text-muted font-mono truncate opacity-50">{chunk.web.uri}</p>
                         </a>
                       ) : null
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}
       </div>
    </div>
  );
};

export default WebExplorer;
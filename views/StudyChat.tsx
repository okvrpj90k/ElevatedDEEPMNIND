import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, StudyMaterial } from '../types';
import ThinkingToggle from '../components/ThinkingToggle';
import { chatWithMaterials } from '../services/geminiService';
import SourceViewer from '../components/SourceViewer';

interface StudyChatProps {
  materials: StudyMaterial[];
}

// High-Tier "Reasoning Engine" Animation
const ThinkingIndicator = () => (
    <div className="relative w-full max-w-md p-6 rounded-2xl bg-space-900/60 border border-accent-primary/20 overflow-hidden shadow-2xl backdrop-blur-md group animate-fade-in my-4">
        {/* Holographic Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent animate-[shimmer_2s_linear_infinite] -skew-x-12 pointer-events-none"></div>
        
        <div className="relative flex items-center gap-5">
            {/* Core Processor Visual */}
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                 {/* Pulse Rings */}
                 <div className="absolute inset-0 bg-accent-primary rounded-full animate-ping opacity-10"></div>
                 <div className="absolute inset-0 border border-accent-primary/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                 <div className="absolute inset-1 border border-dashed border-accent-secondary/40 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                 
                 {/* Central Node */}
                 <div className="relative w-3 h-3 bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(0,240,255,0.8)] z-10">
                    <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
                 </div>
            </div>
            
            <div className="flex-1 space-y-2.5 min-w-0">
                 <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-accent-secondary tracking-[0.2em] uppercase">Reasoning Engine Active</span>
                     <span className="text-[9px] font-mono text-text-muted/70 animate-pulse">Thinking...</span>
                 </div>
                 
                 {/* Data Processing Bar */}
                 <div className="h-1.5 w-full bg-space-950/50 border border-white/5 rounded-full overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-cyan to-accent-primary w-[200%] animate-[shimmer_1.5s_linear_infinite]"></div>
                 </div>

                 <div className="flex items-center gap-2 text-[10px] text-text-muted/60 font-mono">
                     <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                     Analyzing Context Vector &middot; Synthesizing Response
                 </div>
            </div>
        </div>
    </div>
);

const SimpleTypingIndicator = () => (
  <div className="glass-panel rounded-2xl rounded-tl-sm px-6 py-4 flex items-center gap-1.5 border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)] self-start animate-fade-in">
      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1s_infinite]"></span>
      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
  </div>
);

const StudyChat: React.FC<StudyChatProps> = ({ materials }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: 'Systems online. I am ready to analyze your materials.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  
  // Viewer State
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const context = materials.map(m => `[Source: ${m.title}]\n${m.content}`).join('\n\n');
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const text = await chatWithMaterials(history, userMsg.content, context, isThinkingMode);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text || "I couldn't process that. Please try again.",
        isThinking: isThinkingMode
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "Error connecting to Gemini." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (title: string, quote: string) => {
      const found = materials.find(m => m.title.toLowerCase().includes(title.toLowerCase().trim()) || title.toLowerCase().includes(m.title.toLowerCase().trim()));
      if (found) {
          setHighlightText(quote.trim());
          setViewingMaterial(found);
      } else {
          console.warn("Citation material not found:", title);
      }
  };

  const renderMessageContent = (content: string) => {
      const regex = /(\[\[.*?\s\|\s.*?\]\])/g;
      const parts = content.split(regex);

      return parts.map((part, index) => {
          const citationMatch = part.match(/\[\[(.*?)\s\|\s(.*?)\]\]/);
          
          if (citationMatch) {
              const [_, title, quote] = citationMatch;
              return (
                  <button 
                    key={index} 
                    onClick={() => handleCitationClick(title, quote)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 align-baseline rounded-md bg-accent-primary/20 border border-accent-primary/40 text-accent-primary text-xs font-bold cursor-pointer hover:bg-accent-primary hover:text-white transition-all group"
                  >
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     <span className="max-w-[100px] truncate">{title}</span>
                  </button>
              );
          }
          return <span key={index}>{part}</span>;
      });
  };

  return (
    <div className="flex h-full flex-col bg-space-950 relative overflow-hidden">
       {/* Side Panel Viewer */}
       <SourceViewer 
         material={viewingMaterial} 
         highlight={highlightText} 
         onClose={() => setViewingMaterial(null)} 
       />

       {/* Decorative Background Elements */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="px-4 md:px-8 py-3 md:py-5 border-b border-white/5 flex items-center justify-between bg-space-950/80 backdrop-blur-xl sticky top-0 z-20 shadow-lg shadow-black/20 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-space-800 flex items-center justify-center border border-accent-primary/30 text-accent-primary shadow-[0_0_15px_rgba(110,63,243,0.2)]">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
           </div>
           <div>
                <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-tight">Study Chat</h1>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-text-muted/80">
                    <span className={`w-1.5 h-1.5 rounded-full ${materials.length > 0 ? 'bg-accent-cyan shadow-[0_0_8px_cyan]' : 'bg-red-500'}`}></span>
                    <span>{materials.length > 0 ? `${materials.length} Sources` : 'No Context'}</span>
                </div>
           </div>
        </div>
        <ThinkingToggle isEnabled={isThinkingMode} onToggle={() => setIsThinkingMode(!isThinkingMode)} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth pb-32" style={{ transform: 'translate3d(0,0,0)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            
            {msg.role === 'model' && (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-space-900 border border-accent-primary/30 shrink-0 mr-3 md:mr-4 flex items-center justify-center shadow-[0_0_15px_rgba(110,63,243,0.2)] mt-1">
                    <svg className="w-4 h-4 text-accent-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"/></svg>
                </div>
            )}

            <div className={`
              max-w-[85%] md:max-w-[80%] relative group transition-all duration-300
              ${msg.role === 'user' 
                ? 'bg-gradient-to-br from-[#6E3FF3] to-[#5B2AD8] text-white rounded-2xl rounded-tr-sm shadow-[0_8px_20px_rgba(91,42,216,0.3)] border border-white/10' 
                : 'glass-panel rounded-2xl rounded-tl-sm border border-white/5 text-text-main shadow-xl bg-space-900/40 hover:border-accent-primary/30'}
            `}>
              {msg.role === 'model' && msg.isThinking && (
                 <div className="px-6 pt-3 pb-2 border-b border-white/5 flex items-center gap-2 bg-black/20 rounded-t-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse"></div>
                    <span className="text-[10px] font-bold text-accent-secondary uppercase tracking-widest">
                        Deep Reasoning Logic Applied
                    </span>
                 </div>
              )}
              
              <div className="p-4 md:p-6 prose prose-invert prose-sm max-w-none">
                 <p className="whitespace-pre-wrap leading-relaxed tracking-wide text-sm md:text-base">
                    {msg.role === 'model' ? renderMessageContent(msg.content) : msg.content}
                 </p>
              </div>
            </div>

            {msg.role === 'user' && (
               <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-space-800 border border-white/10 shrink-0 ml-3 md:ml-4 flex items-center justify-center mt-1 text-[10px] md:text-xs font-bold text-text-muted">
                  YOU
               </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="w-full pl-12 md:pl-13">
             {isThinkingMode ? <ThinkingIndicator /> : <SimpleTypingIndicator />}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="p-4 md:p-8 pt-2 sticky bottom-0 z-30 w-full">
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-space-950 via-space-950/90 to-transparent pointer-events-none"></div>
        
        <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/50 to-accent-secondary/50 rounded-2xl blur opacity-0 transition-opacity duration-500 focus-within:opacity-30"></div>
            
            <div className="relative flex items-center gap-2 md:gap-3 bg-space-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 pr-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-accent-primary/50 transition-all transform focus-within:-translate-y-1">
                <div className="pl-3 md:pl-4 text-accent-primary/50 hidden md:block">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a complex question..."
                    className="flex-1 bg-transparent border-none px-2 py-3 md:py-4 text-text-main focus:outline-none placeholder:text-text-muted/40 font-medium text-sm md:text-base"
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(110,63,243,0.3)] hover:shadow-[0_0_25px_rgba(110,63,243,0.5)] active:scale-95"
                >
                    <span>Send</span>
                    <svg className="w-4 h-4 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="text-center mt-2 md:mt-3 flex justify-center items-center gap-2 opacity-60">
                <svg className="w-3 h-3 text-accent-secondary hidden md:block" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Private & Grounded Context</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudyChat;
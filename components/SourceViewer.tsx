import React, { useEffect, useRef } from 'react';
import { StudyMaterial } from '../types';

interface SourceViewerProps {
  material: StudyMaterial | null;
  highlight: string | null;
  onClose: () => void;
}

const SourceViewer: React.FC<SourceViewerProps> = ({ material, highlight, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // When opened, content is rendered. The <mark> tag handles the scroll via ref callback.
  
  if (!material) return null;

  // Split content to wrap the highlighted text
  // We escape the highlight string for regex safety if needed, but simple split is often sufficient for this context.
  // A basic split works if the AI quotes exactly.
  const parts = highlight ? material.content.split(highlight) : [material.content];
  
  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-1/2 bg-space-900/95 backdrop-blur-xl border-l border-accent-primary/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-transform z-50 flex flex-col animate-fade-in">
       {/* Header */}
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-space-950">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <div className="flex flex-col min-w-0">
                 <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">Source Viewer</span>
                 <h3 className="font-bold text-white truncate text-sm">{material.title}</h3>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
       </div>
       
       {/* Content */}
       <div className="flex-1 overflow-y-auto p-8 whitespace-pre-wrap text-sm leading-loose text-text-muted font-serif" ref={contentRef}>
          {parts.map((part, i) => (
             <React.Fragment key={i}>
                {part}
                {i < parts.length - 1 && (
                   <mark 
                        className="bg-accent-primary/20 text-white border-b-2 border-accent-primary rounded-sm px-1 py-0.5 animate-pulse scroll-mt-32" 
                        ref={el => {
                            if (el) {
                                // Tiny timeout to ensure layout is ready
                                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                            }
                        }}
                    >
                      {highlight}
                   </mark>
                )}
             </React.Fragment>
          ))}
       </div>
    </div>
  );
};

export default SourceViewer;
import React, { useState } from 'react';
import { StudyMaterial } from '../types';
import { extractTextFromFile, fileToBase64 } from '../services/fileProcessor';
import { processImageContent } from '../services/geminiService';

interface UploadCenterProps {
  onAddMaterial: (m: StudyMaterial) => void;
}

const UploadCenter: React.FC<UploadCenterProps> = ({ onAddMaterial }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Text Input State
  const [textTitle, setTextTitle] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setStatus(`Processing ${file.name}...`);

    try {
      let content = '';
      let type: 'pdf' | 'image' | 'text' = 'text';

      if (file.type.includes('pdf')) {
         type = 'pdf';
         setStatus('Extracting text from PDF...');
         content = await extractTextFromFile(file);
      } else if (file.type.startsWith('image/')) {
         type = 'image';
         setStatus('Analyzing image with Gemini Vision...');
         const base64 = await fileToBase64(file);
         content = await processImageContent(base64, file.type);
      } else {
         type = 'text';
         content = await extractTextFromFile(file);
      }

      if (!content || content.trim().length === 0) {
          throw new Error("No text could be extracted. Please try another file.");
      }

      const newMaterial: StudyMaterial = {
        id: Date.now().toString(),
        title: file.name,
        type: type,
        content: content,
        dateAdded: Date.now()
      };

      onAddMaterial(newMaterial);
      setStatus('Complete!');
      // Small delay to show completion state
      setTimeout(() => setIsProcessing(false), 1000);

    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textTitle.trim() || !textInput.trim()) return;

    setIsProcessing(true);
    setStatus('Ingesting text content...');

    // Simulate async processing briefly for UX consistency
    setTimeout(() => {
        const newMaterial: StudyMaterial = {
            id: Date.now().toString(),
            title: textTitle,
            type: 'text',
            content: textInput,
            dateAdded: Date.now()
        };

        onAddMaterial(newMaterial);
        
        setTextTitle('');
        setTextInput('');
        setStatus('Complete!');
        
        setTimeout(() => {
            setIsProcessing(false);
            setStatus('');
        }, 1000);
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in h-full overflow-y-auto" style={{ transform: 'translate3d(0,0,0)' }}>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-text-main mb-2">Upload & Input</h1>
      <p className="text-text-muted mb-8 text-sm md:text-base">Add materials to train your personalized AI Tutor.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Column 1: File Drop Zone */}
        <div className="flex flex-col gap-6">
            <label 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`
                relative cursor-pointer flex-1 min-h-[250px] md:min-h-[300px]
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                flex flex-col items-center justify-center
                ${isDragging ? 'border-accent-primary bg-accent-primary/10' : 'border-accent-muted bg-space-900/50 hover:border-text-muted'}
            `}
            >
            <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.txt,.md,.json,image/*" />
            
            {isProcessing && !textInput.trim() ? ( // Only show loader here if it's file processing (heuristic)
                <div className="animate-pulse-slow flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-accent-primary font-medium">{status}</span>
                </div>
            ) : (
                <>
                <div className="w-16 h-16 mb-4 text-accent-secondary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-text-main mb-1">Drag & Drop Files</h3>
                <p className="text-sm text-text-muted mb-4">PDF, Text, Markdown, or Images (PNG/JPG)</p>
                <span className="px-6 py-2 bg-space-800 hover:bg-space-700 text-text-main rounded-lg border border-accent-muted transition-colors text-sm">
                    Browse Files
                </span>
                </>
            )}
            </label>
            
            <div className="bg-space-900/30 border border-accent-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-text-muted">For YouTube videos, please use the <span className="text-accent-secondary font-medium">YouTube Analyzer</span> section.</p>
            </div>
        </div>

        {/* Column 2: Text Input */}
        <div className="glass-panel rounded-xl p-6 flex flex-col h-full border border-white/5 relative overflow-hidden min-h-[400px]">
            {isProcessing && textInput.trim().length > 0 && (
                 <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-white font-bold tracking-wide">{status}</span>
                 </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-space-800 border border-white/10 flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Direct Text Entry</h3>
                    <p className="text-xs text-text-muted">Paste articles, notes, or snippets manually.</p>
                </div>
            </div>

            <div className="space-y-5 flex-1 flex flex-col">
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Title / Source Name</label>
                    <input 
                        type="text" 
                        value={textTitle}
                        onChange={(e) => setTextTitle(e.target.value)}
                        placeholder="e.g., Chapter 4 Summary"
                        className="w-full bg-space-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all placeholder:text-text-muted/30"
                    />
                </div>
                
                <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Content</label>
                    <textarea 
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste your study material here..."
                        className="w-full flex-1 min-h-[150px] bg-space-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all resize-none font-mono text-sm leading-relaxed placeholder:text-text-muted/30"
                    />
                </div>
            </div>

            <button 
                onClick={handleTextSubmit}
                disabled={isProcessing || !textInput.trim() || !textTitle.trim()}
                className="w-full mt-6 py-4 bg-white text-space-950 rounded-xl font-bold hover:bg-accent-cyan hover:text-space-950 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
            >
                <span>Submit Material</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCenter;
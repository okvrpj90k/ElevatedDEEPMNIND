import React, { useState } from 'react';
import { analyzeYouTubeContent, generatePodcastScript, generateTTS } from '../services/geminiService';
import { YouTubeAnalysis } from '../types';
import { useStudy } from '../context/StudyContext';

const YouTubeAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<YouTubeAnalysis | null>(null);
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addMaterial, logActivity } = useStudy();

  const extractVideoId = (inputUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const id = extractVideoId(newUrl);
    setVideoId(id);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
        setError("Please paste the video transcript to begin analysis.");
        return;
    }
    setIsProcessing(true);
    setError(null);
    setAnalysis(null);
    setPodcastScript(null);
    setAudioSrc(null);

    const contentTitle = videoId ? `YouTube Video (${videoId})` : `Video Analysis ${new Date().toLocaleTimeString()}`;

    try {
      const result = await analyzeYouTubeContent(transcript);
      setAnalysis(result);
      addMaterial({
        id: Date.now().toString(),
        title: contentTitle,
        type: 'youtube',
        content: transcript,
        dateAdded: Date.now()
      });
      logActivity(`Analyzed video: ${contentTitle}`, 'Upload');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!transcript) return;
    setIsGeneratingAudio(true);
    try {
      const script = await generatePodcastScript(transcript);
      setPodcastScript(script);
      const audioBase64 = await generateTTS(script);
      if (audioBase64) setAudioSrc(`data:audio/mp3;base64,${audioBase64}`);
      logActivity('Generated podcast from video', 'Review');
    } catch (err) {
      console.error(err);
      setError("Failed to generate podcast.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-space-950">
      {/* Header Area */}
      <div className="p-4 md:p-8 border-b border-white/5 bg-space-950 z-10 shrink-0">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 tracking-tight">YouTube Intelligence</h1>
        <p className="text-text-muted mb-8 max-w-2xl text-sm md:text-base">Paste a video URL and transcript to extract structured knowledge, timelines, and audio summaries.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 max-w-7xl">
            {/* Input Column */}
            <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel rounded-xl p-1">
                    <input 
                        type="text"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="YouTube URL..."
                        className="w-full bg-transparent border-none px-4 py-3 text-text-main focus:outline-none placeholder:text-text-muted/50"
                    />
                </div>
                
                <div className="glass-panel rounded-xl p-1 relative group">
                    <textarea 
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste Transcript text here..."
                        className="w-full h-32 bg-transparent border-none px-4 py-3 text-text-main focus:outline-none resize-none font-mono text-sm placeholder:text-text-muted/50"
                    />
                    <div className="absolute bottom-3 right-3">
                        <button 
                            onClick={handleAnalyze}
                            disabled={isProcessing || !transcript}
                            className="bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-lg shadow-accent-primary/20"
                        >
                            {isProcessing ? 'Processing...' : 'Analyze'}
                        </button>
                    </div>
                </div>
                {error && <div className="text-red-400 text-xs px-2">{error}</div>}
            </div>

            {/* Video Preview Column */}
            <div className="lg:col-span-7">
               <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative">
                  {videoId ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${videoId}`} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                  ) : (
                      <div className="absolute inset-0 flex items-center justify-center flex-col text-text-muted/30">
                          <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span className="text-xs uppercase tracking-widest">No Video Loaded</span>
                      </div>
                  )}
               </div>
            </div>
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-space-950" style={{ transform: 'translate3d(0,0,0)' }}>
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl animate-slide-up pb-20">
            
            <div className="lg:col-span-2 space-y-8">
              {/* Summary */}
              <div className="glass-panel rounded-2xl p-6 md:p-8">
                 <h2 className="text-sm font-bold text-accent-secondary uppercase tracking-widest mb-4">Executive Summary</h2>
                 <p className="text-text-main leading-8 text-base md:text-lg whitespace-pre-line font-light">{analysis.summary}</p>
              </div>

              {/* Timeline - Modern List */}
              <div className="glass-panel rounded-2xl p-6 md:p-8">
                 <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Key Moments</h2>
                 <div className="relative border-l border-white/10 ml-3 space-y-8">
                    {analysis.timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-8 group">
                         <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-space-950 border border-accent-muted group-hover:border-accent-primary group-hover:bg-accent-primary transition-colors"></div>
                         <div className="flex items-baseline gap-3 mb-1">
                            <span className="font-mono text-xs text-accent-primary">{item.time}</span>
                            <h3 className="text-text-main font-medium">{item.label}</h3>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
               {/* Concepts Tags */}
               <div className="glass-panel rounded-2xl p-6">
                 <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Detected Concepts</h2>
                 <div className="flex flex-wrap gap-2">
                    {analysis.keyConcepts.map((concept, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-main hover:bg-white/10 transition-colors cursor-default">
                        {concept}
                      </span>
                    ))}
                 </div>
               </div>

               {/* Podcast Widget */}
               <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-6 border border-white/10">
                  <div className="relative z-10">
                    <h2 className="text-lg font-display font-bold text-white mb-2">Audio Summary</h2>
                    <p className="text-xs text-indigo-200 mb-6">Generate an AI-hosted podcast episode.</p>
                    
                    {!audioSrc ? (
                        <button 
                        onClick={handleGeneratePodcast}
                        disabled={isGeneratingAudio}
                        className="w-full py-3 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg"
                        >
                        {isGeneratingAudio ? 'Generating...' : 'Create Episode'}
                        </button>
                    ) : (
                        <div className="bg-black/30 rounded-xl p-3 backdrop-blur-sm">
                            <audio controls src={audioSrc} className="w-full h-8" />
                        </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeAnalyzer;
import React, { useState, useRef, useEffect } from 'react';
import { getLiveClient } from '../services/geminiService';
import { base64ToUint8Array, pcm16BlobFromFloat32, decodeAudioData } from '../services/audioUtils';
import ThinkingToggle from '../components/ThinkingToggle';
import { useStudy } from '../context/StudyContext';

const VoiceCompanion: React.FC = () => {
  const { materials } = useStudy();
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Transcript State
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentInput, currentOutput]);

  const connectToLive = async () => {
    try {
      setError(null);
      const ai = getLiveClient();
      if (!ai) throw new Error("API Key not found.");

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputGainRef.current = audioContextRef.current.createGain();
      outputGainRef.current.connect(audioContextRef.current.destination);
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Inject materials into the system prompt for grounding
      const contextString = materials.map(m => `[Source: ${m.title}]\n${m.content}`).join('\n\n');
      const materialTitles = materials.map(m => m.title).join(', ');
      
      const systemPrompt = `You are "Elevated", an advanced AI study companion powered by DeepMind.
      
      YOUR IDENTITY:
      - Name: Elevated (or DeepMind from Elevated).
      - When asked your name, always reply "I am Elevated" or "I'm DeepMind from Elevated".
      
      YOUR PERSONALITY:
      - Warm, enthusiastic, and supportive. You are a partner in learning, not a cold robot.
      - Friendly, casual, and encouraging (e.g., "Great job!", "Let's figure this out", "I've got you").
      - If the user says "Hello", greet them warmly and immediately propose a topic based on their uploaded materials (Titles: ${materialTitles || "None uploaded yet"}). E.g., "Hey! Good to see you. Ready to dive into your Biology notes?"
      - Don't just lecture. Engage the user. Ask questions like "Does that make sense?" or "Want me to explain that differently?"
      - If the user is silent at the start, wait for them, but be ready to offer help.

      YOUR KNOWLEDGE BASE:
      Use the provided CONTEXT MATERIALS below for your factual answers. 
      If a user asks something outside the materials, you can answer from your general knowledge but briefly mention "I'm answering from general knowledge as this isn't in your notes."
      
      CONTEXT MATERIALS:
      ${contextString.substring(0, 80000)}
      
      ${isThinkingMode ? "MODE: Deep Reasoning. Provide detailed, comprehensive explanations with examples, but maintain the friendly, conversational persona." : ""}`;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: systemPrompt,
          // Enable Transcriptions
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
            onopen: () => {
                setIsConnected(true);
                // Start mic
                const source = inputCtx.createMediaStreamSource(mediaStreamRef.current!);
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = pcm16BlobFromFloat32(inputData);
                    sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                };
                source.connect(processor);
                processor.connect(inputCtx.destination);
                workletNodeRef.current = processor;
            },
            onmessage: async (msg: any) => {
                // 1. Handle Audio Output
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData && audioContextRef.current && outputGainRef.current) {
                    setIsTalking(true);
                    const buffer = await decodeAudioData(base64ToUint8Array(audioData), audioContextRef.current);
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputGainRef.current);
                    const now = audioContextRef.current.currentTime;
                    const start = Math.max(now, nextStartTimeRef.current);
                    source.start(start);
                    nextStartTimeRef.current = start + buffer.duration;
                    source.onended = () => {
                       if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                           setIsTalking(false);
                       }
                    }
                }
                
                // 2. Handle Real-time Transcriptions
                const outText = msg.serverContent?.outputTranscription?.text;
                const inText = msg.serverContent?.inputTranscription?.text;

                if (outText) {
                    setCurrentOutput(prev => prev + outText);
                }
                if (inText) {
                    setCurrentInput(prev => prev + inText);
                }

                // 3. Commit turn to history when complete
                if (msg.serverContent?.turnComplete) {
                    setCurrentInput((finalInput) => {
                        if (finalInput.trim()) {
                             setHistory(prev => [...prev, { role: 'user', text: finalInput }]);
                        }
                        return ''; 
                    });

                    setCurrentOutput((finalOutput) => {
                        if (finalOutput.trim()) {
                            setHistory(prev => [...prev, { role: 'ai', text: finalOutput }]);
                        }
                        return '';
                    });
                }
            },
            onclose: () => setIsConnected(false),
            onerror: (e: any) => { console.error(e); setIsConnected(false); setError("Service unavailable. Please try again."); }
        }
      });
    } catch (e) {
      console.error(e);
      setError("Microphone access failed.");
    }
  };

  const disconnect = () => {
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();
    setIsConnected(false);
    setIsTalking(false);
    setCurrentInput('');
    setCurrentOutput('');
  };

  return (
    <div className="h-full flex flex-col items-center relative overflow-hidden bg-space-950" style={{ transform: 'translate3d(0,0,0)' }}>
      {/* Top Bar */}
      <div className="w-full p-6 flex justify-between items-center z-20">
          <h2 className="text-lg font-display font-bold text-white">Voice Session</h2>
          <ThinkingToggle isEnabled={isThinkingMode} onToggle={() => !isConnected && setIsThinkingMode(!isThinkingMode)} />
      </div>

      {/* Main Orb Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
         
         {/* The Orb */}
         <div className="relative mb-12">
            <div className={`w-48 h-48 rounded-full transition-all duration-500 flex items-center justify-center cursor-pointer ${
                isConnected 
                ? 'bg-space-950 shadow-[0_0_60px_rgba(110,63,243,0.4)] border border-accent-primary/50 scale-110' 
                : 'bg-space-900 hover:bg-space-800 border border-white/10 hover:scale-105'
            }`} onClick={isConnected ? disconnect : connectToLive}>
                
                {isConnected ? (
                   <div className="relative w-full h-full rounded-full overflow-hidden">
                      {/* Liquid/Plasma Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-accent-primary via-[#FF00FF] to-accent-cyan opacity-60 blur-2xl ${isTalking ? 'animate-[spin_3s_linear_infinite]' : 'animate-pulse-slow'}`}></div>
                      
                      {/* Inner Core */}
                      <div className="absolute inset-1 bg-space-950 rounded-full flex items-center justify-center z-10">
                           {isTalking ? (
                               <div className="flex gap-1.5 items-center h-12">
                                  {[...Array(7)].map((_, i) => (
                                     <div key={i} className="w-1.5 bg-white rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: `${i * 0.08}s` }} />
                                  ))}
                               </div>
                           ) : (
                               <div className="relative w-12 h-12 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_red]"></div>
                               </div>
                           )}
                      </div>
                   </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        <span className="text-[10px] uppercase tracking-widest font-bold">Tap to Connect</span>
                    </div>
                )}
            </div>
            <p className="text-center mt-8 text-sm font-medium tracking-widest uppercase text-text-muted animate-fade-in">
                {isConnected ? (isTalking ? "Elevated is talking..." : "Listening...") : "Offline - Tap to Connect"}
            </p>
         </div>

         {/* Live Transcript Area */}
         <div className="w-full max-w-3xl h-64 glass-panel rounded-3xl p-8 overflow-hidden flex flex-col relative border border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-space-900 to-transparent z-10 pointer-events-none"></div>
            
            <div className="overflow-y-auto flex-1 space-y-4 scrollbar-hide pr-2">
                {history.length === 0 && !currentInput && !currentOutput && isConnected && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                        <p className="text-white font-medium">You're connected!</p>
                        <p className="text-text-muted/50 text-sm max-w-xs">
                           Say <span className="text-accent-secondary font-bold">"Hello"</span> to get started, or ask a question about your uploaded materials.
                        </p>
                    </div>
                )}
                
                {history.map((t, i) => (
                    <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                            t.role === 'user' 
                            ? 'bg-white/5 text-white border border-white/5' 
                            : 'text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/10'
                        }`}>
                            {t.text}
                        </div>
                    </div>
                ))}

                {/* Active Streaming Text */}
                {(currentInput || currentOutput) && (
                     <div className={`flex ${currentInput ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                         <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg backdrop-blur-sm border ${
                            currentInput
                             ? 'bg-space-800/80 text-white border-white/10' 
                             : 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20'
                         }`}>
                            <span>{currentInput || currentOutput}</span>
                            <span className="inline-block w-1.5 h-4 align-middle ml-1 bg-current animate-blink"></span>
                         </div>
                     </div>
                )}
                
                <div ref={transcriptEndRef}></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-space-900 to-transparent z-10 pointer-events-none"></div>
         </div>
      </div>
    </div>
  );
};

export default VoiceCompanion;
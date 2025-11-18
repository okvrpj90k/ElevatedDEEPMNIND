import React, { useState } from 'react';
import { StudyMaterial, Flashcard } from '../types';
import { generateFlashcardsFromText } from '../services/geminiService';
import { useStudy } from '../context/StudyContext';
import ThinkingToggle from '../components/ThinkingToggle';

interface FlashcardsProps {
  materials: StudyMaterial[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ materials }) => {
  const { logActivity, updateStats } = useStudy();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);

  const handleGenerate = async () => {
    if (materials.length === 0) return;
    setIsGenerating(true);
    try {
      const allText = materials.map(m => m.content).join('\n');
      const newCards = await generateFlashcardsFromText(allText, 7); 
      setCards(newCards.map((c: any, i: number) => ({
        id: i.toString(),
        front: c.front,
        back: c.back,
        difficulty: 'new'
      })));
      setCurrentIndex(0);
      setIsFlipped(false);
      logActivity('Generated new flashcard deck', 'Review');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    updateStats('cardsReviewed', 1);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length);
    }, 300);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in text-center bg-space-950">
         <div className="relative">
             <div className="absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full"></div>
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="relative px-10 py-4 bg-white text-space-950 rounded-xl font-display font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
                {isGenerating ? 'Synthesizing Deck...' : 'Generate Flashcards'}
            </button>
         </div>
         <p className="mt-6 text-text-muted font-light tracking-wide">Based on {materials.length} uploaded sources</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="h-full flex flex-col items-center p-8 bg-space-950 relative overflow-hidden">
      {/* Top Control Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 z-10">
         <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
            Card {currentIndex + 1} <span className="text-white/20 mx-2">/</span> {cards.length}
         </div>
         <ThinkingToggle isEnabled={isThinkingMode} onToggle={() => setIsThinkingMode(!isThinkingMode)} />
      </div>

      {/* The 3D Card */}
      <div className="flex-1 w-full flex items-center justify-center perspective-1000 z-10">
        <div 
            className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-space-900 border border-white/10 p-12 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-accent-primary/30 transition-colors">
                    <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-accent-primary"></div>
                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-accent-primary"></div>
                    
                    <span className="text-accent-primary text-xs font-bold uppercase tracking-[0.3em] mb-8">Concept</span>
                    <h3 className="text-3xl md:text-4xl font-display font-medium text-white leading-tight">
                        {currentCard.front}
                    </h3>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-accent-primary/10 to-space-900 border border-accent-primary/50 p-12 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(110,63,243,0.2)]">
                    <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-8">Definition</span>
                    <p className="text-xl md:text-2xl text-white leading-relaxed font-light">
                        {currentCard.back}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-xl grid grid-cols-3 gap-4 mt-8 z-10">
        <button onClick={handleNext} className="py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase text-xs font-bold tracking-widest">
            Hard
        </button>
        <button onClick={handleNext} className="py-4 rounded-xl bg-white text-space-950 hover:scale-105 transition-all shadow-lg uppercase text-xs font-bold tracking-widest">
            Good
        </button>
        <button onClick={handleNext} className="py-4 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 hover:bg-green-500 hover:text-white transition-all uppercase text-xs font-bold tracking-widest">
            Easy
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { StudyMaterial, QuizQuestion } from '../types';
import { useStudy } from '../context/StudyContext';
import ThinkingToggle from '../components/ThinkingToggle';

const Quiz: React.FC<{ materials: StudyMaterial[] }> = ({ materials }) => {
  const { logActivity, updateStats } = useStudy();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);

  const startQuiz = async () => {
     if (materials.length === 0) return;
     setIsGenerating(true);
     const combinedText = materials.map(m => m.content).join('\n');
     try {
       const qs = await generateQuiz(combinedText);
       setQuestions(qs.map((q: any, i: number) => ({...q, id: i.toString()})));
       setCurrentQIndex(0);
       setScore(0);
       setShowResults(false);
       setSelectedOption(null);
       setShowExplanation(false);
       logActivity('Started a new quiz', 'Quiz');
     } catch (e) {
       console.error(e);
     } finally {
       setIsGenerating(false);
     }
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === questions[currentQIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
      const finalScorePercent = (score / questions.length) * 100;
      setShowResults(true);
      updateStats('quizAverage', finalScorePercent);
      logActivity(`Completed quiz: ${Math.round(finalScorePercent)}% score`, 'Quiz');
  };

  if (questions.length === 0 && !showResults) {
     return (
       <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-8 bg-space-950">
         <div className="bg-glass-panel p-12 rounded-3xl border border-white/5 shadow-2xl max-w-lg w-full">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Skill Assessment</h2>
            <p className="text-text-muted mb-8 leading-relaxed">Generate a dynamic evaluation based on your context materials. Test your retention and reasoning.</p>
            
            <div className="flex flex-col gap-4">
                <ThinkingToggle isEnabled={isThinkingMode} onToggle={() => setIsThinkingMode(!isThinkingMode)} />
                <button 
                    onClick={startQuiz}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(110,63,243,0.4)] transition-all disabled:opacity-50"
                >
                    {isGenerating ? 'Compiling Questions...' : 'Begin Assessment'}
                </button>
            </div>
         </div>
       </div>
     );
  }

  if (showResults) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-slide-up p-8 bg-space-950">
        <div className="bg-space-900 border border-white/10 rounded-3xl p-12 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
           
           <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Result Analysis</h2>
           <div className="text-7xl font-display font-bold text-white mb-6 tracking-tighter">
                {Math.round((score / questions.length) * 100)}<span className="text-3xl text-white/30">%</span>
           </div>
           <p className="text-text-main mb-8">Correctly answered {score} out of {questions.length} questions.</p>
           <button onClick={() => setQuestions([])} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-colors">
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col justify-center bg-space-950">
      {/* Progress Header */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
           <span className="text-xs font-bold text-accent-primary uppercase tracking-widest">Question {currentQIndex + 1}</span>
           <ThinkingToggle isEnabled={isThinkingMode} onToggle={() => setIsThinkingMode(!isThinkingMode)} />
        </div>
        <div className="h-1 w-full bg-space-900 rounded-full overflow-hidden">
          <div className="h-full bg-accent-primary transition-all duration-500 ease-out" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-display font-medium text-white mb-10 leading-tight">{q.question}</h3>

      <div className="space-y-4 mb-8">
        {q.options.map((opt, idx) => {
          let stateClasses = "bg-space-900 border-white/10 hover:bg-space-800 text-text-main";
          
          if (selectedOption !== null) {
            if (idx === q.correctAnswer) stateClasses = "bg-green-500/10 border-green-500 text-green-400";
            else if (idx === selectedOption) stateClasses = "bg-red-500/10 border-red-500 text-red-400";
            else stateClasses = "bg-space-950 border-transparent opacity-30";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center group ${stateClasses}`}
            >
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center mr-5 text-xs font-bold transition-colors ${selectedOption === null ? 'border-white/10 bg-white/5 group-hover:border-accent-primary' : 'border-transparent bg-transparent'}`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-lg">{opt}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="bg-space-900/50 border-l-2 border-accent-primary p-6 rounded-r-xl mb-8 animate-fade-in">
          <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-2">Logic & Reasoning</h4>
          <p className="text-text-muted leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="h-16 flex justify-end">
        {selectedOption !== null && (
          <button onClick={nextQuestion} className="px-8 py-3 bg-white text-space-950 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
            {currentQIndex < questions.length - 1 ? 'Continue' : 'Finish Review'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
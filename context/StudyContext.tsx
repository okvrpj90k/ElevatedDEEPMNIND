import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StudyMaterial, ActivityLog, UserStats } from '../types';

interface StudyContextType {
  materials: StudyMaterial[];
  stats: UserStats;
  recentActivity: ActivityLog[];
  addMaterial: (m: StudyMaterial) => void;
  logActivity: (title: string, type: ActivityLog['type']) => void;
  updateStats: (key: keyof UserStats, value: number) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<UserStats>({
    streakDays: 1, // Defaults to 1 for the first session
    cardsReviewed: 0,
    quizzesTaken: 0,
    quizAverage: 0,
  });

  // Load initial data from local storage could happen here in a real app
  
  const addMaterial = (m: StudyMaterial) => {
    setMaterials(prev => [m, ...prev]);
    logActivity(`Added material: ${m.title}`, 'Upload');
  };

  const logActivity = (title: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      title,
      type,
      timestamp: Date.now(),
    };
    setRecentActivity(prev => [newLog, ...prev].slice(0, 20)); // Keep last 20
  };

  const updateStats = (key: keyof UserStats, value: number) => {
    setStats(prev => {
        if (key === 'quizAverage') {
            // Update running average
            const oldTotal = prev.quizAverage * prev.quizzesTaken;
            const newCount = prev.quizzesTaken + 1;
            return {
                ...prev,
                quizzesTaken: newCount,
                quizAverage: (oldTotal + value) / newCount
            };
        }
        if (key === 'cardsReviewed') {
             return { ...prev, [key]: prev[key] + value };
        }
        // Direct set for others if needed
        return { ...prev, [key]: value };
    });
  };

  return (
    <StudyContext.Provider value={{ materials, stats, recentActivity, addMaterial, logActivity, updateStats }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
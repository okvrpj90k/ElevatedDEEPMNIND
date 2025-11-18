export enum AppView {
  DASHBOARD = 'dashboard',
  UPLOAD = 'upload',
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
  NOTES = 'notes',
  STUDY_CHAT = 'study_chat',
  VOICE = 'voice',
  YOUTUBE = 'youtube',
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'youtube' | 'text';
  content: string; // Extracted text content
  dateAdded: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  materialId?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'new';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  citations?: string[];
  isThinking?: boolean;
}

export interface WebSearchResult {
  title: string;
  uri: string;
  snippet: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface YouTubeAnalysis {
  summary: string;
  timeline: { time: string; label: string }[];
  keyConcepts: string[];
  podcastScript?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  timestamp: number;
  type: 'Upload' | 'Quiz' | 'Review' | 'Voice' | 'Search';
}

export interface UserStats {
  streakDays: number;
  cardsReviewed: number;
  quizzesTaken: number;
  quizAverage: number;
}
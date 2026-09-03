export interface CognitiveBiasDimension {
  name: string;
  score: number; // 0 to 100
  description?: string;
}

export interface CognitiveRadarData {
  dimensions: CognitiveBiasDimension[];
  dominantPattern?: string;
  reframeInsight?: string;
}

export interface EmotionalMetric {
  trait: string; // 'Clarity', 'Calm', 'Optimism', 'Agency'
  score: number; // 0 to 100
}

export interface EmotionalResonanceData {
  primaryTone: string;
  energyLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  valenceScore: number; // 0 to 100
  metrics: EmotionalMetric[];
  resonanceNote?: string;
}

export interface JournalTurn {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type EntryCategory = 'Reflection' | 'Brainstorming' | 'Summary' | 'Gratitude' | 'Mindset';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: EntryCategory;
  turns: JournalTurn[];
  summary?: string;
  keyInsights?: string[];
  suggestedPrompts?: string[];
  cognitiveRadar?: CognitiveRadarData;
  emotionalResonance?: EmotionalResonanceData;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface GeminiReflectRequest {
  prompt: string;
  category?: EntryCategory;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  entryTitle?: string;
}

export interface GeminiReflectResponse {
  reply: string;
  summary?: string;
  keyInsights?: string[];
  suggestedPrompts?: string[];
  cognitiveRadar?: CognitiveRadarData;
  emotionalResonance?: EmotionalResonanceData;
  modelUsed?: string;
}

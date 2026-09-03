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
  modelUsed?: string;
}

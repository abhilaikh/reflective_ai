import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  getUserJournalEntries, 
  saveJournalEntry, 
  deleteUserEntry 
} from './firebase';
import { JournalEntry, JournalTurn, UserProfile, EntryCategory } from './types';
import { Navbar } from './components/Navbar';
import { AuthLanding } from './components/AuthLanding';
import { EntryHistoryList } from './components/EntryHistoryList';
import { JournalEditor } from './components/JournalEditor';
import { InsightsPanel } from './components/InsightsPanel';
import { SecurityModal } from './components/SecurityModal';
import { BookOpen, Sparkles, History as HistoryIcon, PanelRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastModelUsed, setLastModelUsed] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'history' | 'insights'>('editor');

  // Helper to create a new draft reflection entry
  const createNewDraftEntry = useCallback((userId: string): JournalEntry => {
    const now = Date.now();
    return {
      id: crypto.randomUUID(),
      userId,
      title: 'New Reflection',
      category: 'Reflection',
      turns: [],
      summary: '',
      keyInsights: [],
      suggestedPrompts: [],
      createdAt: now,
      updatedAt: now,
    };
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setCurrentUser(profile);
        await loadUserEntries(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        setEntries([]);
        setActiveEntry(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch entries from Firestore for authenticated user
  const loadUserEntries = async (userId: string) => {
    try {
      setIsEntriesLoading(true);
      const userEntries = await getUserJournalEntries(userId);
      setEntries(userEntries);
      if (userEntries.length > 0) {
        setActiveEntry(userEntries[0]);
      } else {
        const draft = createNewDraftEntry(userId);
        setActiveEntry(draft);
      }
    } catch (err: any) {
      console.error('Error fetching journal entries from Firestore:', err);
      setErrorMessage('Unable to load past entries from Firestore.');
    } finally {
      setIsEntriesLoading(false);
    }
  };

  // Handle Google Sign In
  const handleSignIn = async () => {
    setErrorMessage(null);
    await signInWithGoogle();
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Create a new reflection entry
  const handleNewEntry = () => {
    if (!currentUser) return;
    const newEntry = createNewDraftEntry(currentUser.uid);
    setActiveEntry(newEntry);
    setMobileTab('editor');
    setErrorMessage(null);
  };

  // Update entry title
  const handleUpdateEntryTitle = async (newTitle: string) => {
    if (!activeEntry || !currentUser) return;
    const updated: JournalEntry = {
      ...activeEntry,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setActiveEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    // Only persist if it has turns or user changed title
    try {
      setSaveStatus('saving');
      await saveJournalEntry(currentUser.uid, updated);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to update title in Firestore:', err);
      setSaveStatus('error');
    }
  };

  // Update entry category
  const handleUpdateEntryCategory = async (newCategory: EntryCategory) => {
    if (!activeEntry || !currentUser) return;
    const updated: JournalEntry = {
      ...activeEntry,
      category: newCategory,
      updatedAt: Date.now(),
    };
    setActiveEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    try {
      setSaveStatus('saving');
      await saveJournalEntry(currentUser.uid, updated);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to update category in Firestore:', err);
      setSaveStatus('error');
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteUserEntry(currentUser.uid, entryId);
      const remaining = entries.filter((e) => e.id !== entryId);
      setEntries(remaining);
      if (activeEntry?.id === entryId) {
        setActiveEntry(remaining[0] || createNewDraftEntry(currentUser.uid));
      }
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      setErrorMessage('Failed to delete entry from Firestore.');
    }
  };

  // Send message to Gemini and persist both user and AI turns
  const handleSendMessage = async (text: string) => {
    if (!currentUser || !activeEntry) return;

    setErrorMessage(null);
    setLastFailedMessage(null);

    const userTurn: JournalTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Auto-update title if it's currently untitled or default and this is first turn
    const defaultTitle =
      activeEntry.title === 'New Reflection' || !activeEntry.title
        ? text.slice(0, 36) + (text.length > 36 ? '...' : '')
        : activeEntry.title;

    const entryWithUserTurn: JournalEntry = {
      ...activeEntry,
      title: defaultTitle,
      turns: [...activeEntry.turns, userTurn],
      updatedAt: Date.now(),
    };

    // Optimistically update UI
    setActiveEntry(entryWithUserTurn);
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entryWithUserTurn.id);
      return exists
        ? prev.map((e) => (e.id === entryWithUserTurn.id ? entryWithUserTurn : e))
        : [entryWithUserTurn, ...prev];
    });

    // Guaranteed initial save of user's thought to Firestore
    try {
      setSaveStatus('saving');
      await saveJournalEntry(currentUser.uid, entryWithUserTurn);
      setSaveStatus('saved');
    } catch (err: any) {
      console.warn('Initial Firestore save failed, will retry after generation:', err);
      setSaveStatus('error');
    }

    // Call Gemini Reflection API
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          category: entryWithUserTurn.category,
          entryTitle: entryWithUserTurn.title,
          history: activeEntry.turns.map((t) => ({
            role: t.role,
            content: t.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setLastModelUsed(data.modelUsed);

      const modelTurn: JournalTurn = {
        id: crypto.randomUUID(),
        role: 'model',
        content: data.reply || 'No response generated.',
        timestamp: Date.now(),
      };

      const finalEntry: JournalEntry = {
        ...entryWithUserTurn,
        turns: [...entryWithUserTurn.turns, modelTurn],
        summary: data.summary || entryWithUserTurn.summary,
        keyInsights: data.keyInsights && data.keyInsights.length > 0 ? data.keyInsights : entryWithUserTurn.keyInsights,
        suggestedPrompts: data.suggestedPrompts && data.suggestedPrompts.length > 0 ? data.suggestedPrompts : entryWithUserTurn.suggestedPrompts,
        cognitiveRadar: data.cognitiveRadar || entryWithUserTurn.cognitiveRadar,
        emotionalResonance: data.emotionalResonance || entryWithUserTurn.emotionalResonance,
        updatedAt: Date.now(),
      };

      // Guaranteed transaction verification: Save complete entry to Firestore
      setSaveStatus('saving');
      await saveJournalEntry(currentUser.uid, finalEntry);
      setSaveStatus('saved');

      // Update state
      setActiveEntry(finalEntry);
      setEntries((prev) => prev.map((e) => (e.id === finalEntry.id ? finalEntry : e)));
    } catch (err: any) {
      console.error('Gemini Reflection error:', err);
      setErrorMessage(`AI Reflection failed: ${err.message || 'Please check your connection.'}`);
      setLastFailedMessage(text);
      setSaveStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry handler for failed messages
  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    } else if (activeEntry && currentUser) {
      // Retry saving current entry
      saveJournalEntry(currentUser.uid, activeEntry)
        .then(() => {
          setSaveStatus('saved');
          setErrorMessage(null);
        })
        .catch((err) => {
          setErrorMessage(`Save retry failed: ${err.message}`);
        });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs font-medium text-zinc-400">Initializing ReflectAI &amp; Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] font-sans antialiased text-[#E4E4E7]">
      <Navbar
        user={currentUser}
        onSignOut={handleSignOut}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        entryCount={entries.length}
      />

      {!currentUser ? (
        <AuthLanding
          onSignIn={handleSignIn}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col h-[calc(100vh-4rem)]">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex items-center justify-around bg-[#121214] border border-[#27272A] rounded-xl p-1 mb-3 shrink-0">
            <button
              onClick={() => setMobileTab('history')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === 'history' ? 'bg-white text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>History ({entries.length})</span>
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === 'editor' ? 'bg-white text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reflection</span>
            </button>
            <button
              onClick={() => setMobileTab('insights')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === 'insights' ? 'bg-white text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </div>

          {/* Desktop 3-Column Layout & Adaptive Mobile Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-0">
            {/* Left Column: Entry History (3 cols) */}
            <div
              className={`h-full lg:col-span-3 min-h-0 ${
                mobileTab === 'history' ? 'block' : 'hidden lg:block'
              }`}
            >
              <EntryHistoryList
                entries={entries}
                activeEntryId={activeEntry?.id || null}
                onSelectEntry={(entry) => {
                  setActiveEntry(entry);
                  setMobileTab('editor');
                }}
                onNewEntry={handleNewEntry}
                onDeleteEntry={handleDeleteEntry}
                isLoading={isEntriesLoading}
              />
            </div>

            {/* Middle Column: Active Reflection Workspace & Multi-turn Chat (6 cols) */}
            <div
              className={`h-full lg:col-span-6 min-h-0 ${
                mobileTab === 'editor' ? 'block' : 'hidden lg:block'
              }`}
            >
              {activeEntry ? (
                <JournalEditor
                  entry={activeEntry}
                  onUpdateEntryTitle={handleUpdateEntryTitle}
                  onUpdateEntryCategory={handleUpdateEntryCategory}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  saveStatus={saveStatus}
                  lastModelUsed={lastModelUsed}
                  errorMessage={errorMessage}
                  onRetry={handleRetry}
                />
              ) : (
                <div className="h-full bg-[#121214] rounded-2xl border border-[#27272A] flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                  <p className="text-sm font-medium mb-3">No Active Reflection</p>
                  <button
                    onClick={handleNewEntry}
                    className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs"
                  >
                    Start Reflection
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: AI Synthesis & Deepening Questions (3 cols) */}
            <div
              className={`h-full lg:col-span-3 min-h-0 ${
                mobileTab === 'insights' ? 'block' : 'hidden lg:block'
              }`}
            >
              <InsightsPanel
                entry={activeEntry}
                onSelectPrompt={(prompt) => {
                  setMobileTab('editor');
                  handleSendMessage(prompt);
                }}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </main>
      )}

      {/* Security Architecture & Agentic Threat Model Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}

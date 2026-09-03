import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Tag,
  Lightbulb,
  FileEdit
} from 'lucide-react';
import { JournalEntry, EntryCategory } from '../types';

interface JournalEditorProps {
  entry: JournalEntry;
  onUpdateEntryTitle: (newTitle: string) => void;
  onUpdateEntryCategory: (newCategory: EntryCategory) => void;
  onSendMessage: (message: string) => Promise<void>;
  isGenerating: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  lastModelUsed?: string;
  errorMessage: string | null;
  onRetry: () => void;
}

const CATEGORIES: EntryCategory[] = [
  'Reflection',
  'Brainstorming',
  'Summary',
  'Gratitude',
  'Mindset',
];

const STARTER_PROMPTS: Record<EntryCategory, string[]> = {
  Reflection: [
    'What was the most challenging decision I faced today, and how did I approach it?',
    'What is draining my mental energy lately, and what can I do to lighten that load?',
  ],
  Brainstorming: [
    'I want to brainstorm 5 novel approaches to solve...',
    'Help me map out the pros and cons of pivoting my project toward...',
  ],
  Summary: [
    'Here are the rough notes from my day. Help me synthesize them into high-level takeaways...',
    'Summarize my accomplishments and what is left open for tomorrow...',
  ],
  Gratitude: [
    'Three unexpected things that went well today and why I appreciate them...',
    'A person who helped me recently and how their contribution made an impact...',
  ],
  Mindset: [
    'I am feeling imposter syndrome about my current role. Help me reframe this positively...',
    'How can I shift my perspective from frustration to curious problem-solving on...',
  ],
};

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onUpdateEntryTitle,
  onUpdateEntryCategory,
  onSendMessage,
  isGenerating,
  saveStatus,
  lastModelUsed,
  errorMessage,
  onRetry,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(entry.title);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleValue(entry.title);
  }, [entry.id, entry.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.turns, isGenerating]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;
    
    // Pass to parent handler which handles submission and error recovery
    await onSendMessage(text);
    // If no error, clear input
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterClick = (prompt: string) => {
    setInputText(prompt);
    textareaRef.current?.focus();
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue.trim() !== entry.title) {
      onUpdateEntryTitle(titleValue.trim());
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121214] rounded-2xl border border-[#27272A] overflow-hidden shadow-xl">
      {/* Top Bar: Title & Category & Save Status */}
      <div className="px-5 py-4 border-b border-[#27272A] bg-[#18181B]/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          {isEditingTitle ? (
            <input
              id="entry-title-input"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleValue(entry.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="w-full text-base font-semibold text-zinc-100 bg-[#18181B] border border-zinc-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-zinc-500"
            />
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <h1 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
                {entry.title || 'Untitled Reflection'}
              </h1>
              <FileEdit className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3" />
            <span>Last updated {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Controls: Category Selector & Persistence Status */}
        <div className="flex items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1">
            <Tag className="w-3 h-3 text-zinc-400" />
            <select
              id="entry-category-select"
              value={entry.category}
              onChange={(e) => onUpdateEntryCategory(e.target.value as EntryCategory)}
              className="text-xs font-medium text-zinc-200 bg-transparent focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#18181B] text-zinc-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Firestore Save Status Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-zinc-400 border-zinc-700 bg-zinc-800/80">
                <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                <span>Syncing Firestore...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400 border-emerald-800/60 bg-emerald-950/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Persisted</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-rose-400 border-rose-800/60 bg-rose-950/40">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Save Alert</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner with Explicit Retry */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/50 border-b border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            id="retry-action-btn"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Turns Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0E0E10]">
        {entry.turns.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/50 text-amber-400 flex items-center justify-center mb-4 border border-amber-800/60 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Begin your reflection
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Write down whatever is on your mind. You can share raw notes, explore an unanswered question, or brainstorm a complex goal. Gemini 3.6 Flash will assist with constructive perspectives.
            </p>

            <div className="w-full text-left space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Suggested starters for {entry.category}:
              </span>
              {STARTER_PROMPTS[entry.category]?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterClick(starter)}
                  className="w-full text-left text-xs p-2.5 rounded-xl border border-[#27272A] hover:border-zinc-600 bg-[#18181B] hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  &ldquo;{starter}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          entry.turns.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-zinc-50 border border-zinc-800 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-white text-zinc-950 font-sans shadow-md'
                      : 'bg-[#18181B] border border-[#27272A] text-zinc-200'
                  }`}
                >
                  <div className={`flex items-center justify-between gap-4 mb-2 pb-1.5 text-[11px] border-b ${
                    isUser ? 'border-zinc-200/80 text-zinc-600' : 'border-zinc-700/60 text-zinc-400'
                  }`}>
                    <span className="font-semibold">
                      {isUser ? 'Your Thought' : 'Gemini 3.6 Flash'}
                    </span>
                    <span className="opacity-75">
                      {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans text-zinc-950 text-[13px] leading-relaxed">
                      {turn.content}
                    </div>
                  ) : (
                    <div className="markdown-body prose prose-invert max-w-none text-[13px] leading-relaxed text-zinc-200">
                      <Markdown>{turn.content}</Markdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-50 flex items-center justify-center shrink-0 shadow-xs mt-1 animate-pulse">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-xs text-zinc-300 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Gemini 3.6 Flash is synthesizing your thoughts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#27272A] bg-[#18181B]/50">
        <div className="relative bg-[#18181B] rounded-xl border border-[#27272A] focus-within:border-zinc-500 shadow-xs">
          <textarea
            id="journal-prompt-input"
            ref={textareaRef}
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              entry.turns.length === 0
                ? `What would you like to reflect on or brainstorm today?`
                : `Continue your multi-turn inquiry or ask for deeper reflections...`
            }
            disabled={isGenerating}
            className="w-full p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 bg-transparent resize-none focus:outline-none disabled:opacity-50"
          />

          <div className="px-3 py-2 flex items-center justify-between border-t border-[#27272A]/70 bg-[#121214]/60 rounded-b-xl">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono text-[10px]">Shift+Enter</kbd> for new line
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {lastModelUsed && (
                <span className="text-[10px] text-zinc-400 px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded">
                  via {lastModelUsed}
                </span>
              )}
              <button
                id="send-reflection-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                <span>Reflect</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

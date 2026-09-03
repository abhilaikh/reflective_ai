import React, { useState } from 'react';
import { Plus, Search, Trash2, Calendar, MessageSquare, Tag } from 'lucide-react';
import { JournalEntry, EntryCategory } from '../types';

interface EntryHistoryListProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  isLoading: boolean;
}

const CATEGORIES: Array<EntryCategory | 'All'> = [
  'All',
  'Reflection',
  'Brainstorming',
  'Summary',
  'Gratitude',
  'Mindset',
];

export const EntryHistoryList: React.FC<EntryHistoryListProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | 'All'>('All');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.summary && entry.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.turns.some((t) => t.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#121214] rounded-2xl border border-[#27272A] overflow-hidden">
      {/* Top action & Search */}
      <div className="p-4 border-b border-[#27272A] space-y-3 bg-[#18181B]/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-100">Journal History</h2>
            <span className="text-[11px] font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700/50 px-2 py-0.5 rounded-full">
              {entries.length}
            </span>
          </div>
          <button
            id="new-reflection-btn"
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reflection</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            id="history-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past reflections..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#18181B] border border-[#27272A] rounded-lg focus:outline-none focus:border-zinc-500 text-zinc-200 placeholder-zinc-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#27272A]/50 p-2 space-y-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading your entries from Firestore...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            {searchTerm || selectedCategory !== 'All'
              ? 'No entries match your search criteria.'
              : 'No journal reflections yet. Click "New Reflection" to write your first entry!'}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`group relative p-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 border border-zinc-700 shadow-sm'
                    : 'hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1 leading-snug">
                    {entry.title || 'Untitled Reflection'}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete reflection "${entry.title}"? This cannot be undone.`)) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-400 p-1 rounded-md transition-opacity"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {entry.summary ? (
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {entry.summary}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic line-clamp-1 mt-1">
                    {entry.turns[0]?.content || 'Empty entry'}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-[#27272A]/80 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {entry.turns.length} {entry.turns.length === 1 ? 'turn' : 'turns'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700/50 text-zinc-300 font-medium">
                    {entry.category}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

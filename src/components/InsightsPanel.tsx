import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  HelpCircle,
  FileText,
  Calendar,
  Clock,
  Brain,
  Activity,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { CognitiveRadarView } from './CognitiveRadarView';
import { EmotionalResonanceView } from './EmotionalResonanceView';

interface InsightsPanelProps {
  entry: JournalEntry | null;
  onSelectPrompt: (prompt: string) => void;
  isGenerating: boolean;
}

type TabType = 'insights' | 'radar' | 'resonance';

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  entry,
  onSelectPrompt,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('insights');

  if (!entry) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-[#121214] rounded-2xl border border-[#27272A]">
        <FileText className="w-8 h-8 mb-2 stroke-1 text-zinc-600" />
        <p className="text-xs font-medium text-zinc-300">No Entry Active</p>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
          Start a new reflection or select an existing one to view AI insights.
        </p>
      </div>
    );
  }

  const wordCount = entry.turns.reduce(
    (total, turn) =>
      total + (turn.content ? turn.content.split(/\s+/).filter(Boolean).length : 0),
    0
  );

  const hasRadarData = Boolean(entry.cognitiveRadar?.dimensions?.length);
  const hasResonanceData = Boolean(entry.emotionalResonance?.metrics?.length);

  return (
    <div className="h-full flex flex-col space-y-3 bg-[#121214] rounded-2xl border border-[#27272A] p-4 sm:p-5 overflow-y-auto">
      {/* Header / Meta */}
      <div className="border-b border-[#27272A] pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Psychological &amp; AI Analysis
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-300 font-medium">
            {entry.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.turns.length} {entry.turns.length === 1 ? 'turn' : 'turns'} &bull; {wordCount} words
          </span>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] border border-[#27272A] rounded-xl">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'insights'
              ? 'bg-[#27272A] text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'radar'
              ? 'bg-[#27272A] text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Brain className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">Radar</span>
          {hasRadarData && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('resonance')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'resonance'
              ? 'bg-[#27272A] text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">Mood</span>
          {hasResonanceData && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Tab Content 1: Insights & Synthesis */}
      {activeTab === 'insights' && (
        <div className="space-y-4 pt-1">
          {/* Synthesis Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Summary</span>
            </div>
            {entry.summary ? (
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-300 leading-relaxed font-sans">
                {entry.summary}
              </div>
            ) : (
              <div className="p-3 bg-[#18181B]/50 border border-dashed border-[#27272A] rounded-xl text-xs text-zinc-500 italic">
                {isGenerating
                  ? 'Synthesizing reflection with Gemini...'
                  : 'Add your first thought to generate a summary.'}
              </div>
            )}
          </div>

          {/* Key Insights / Takeaways */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
              <span>Key Insights &amp; Realizations</span>
            </div>
            {entry.keyInsights && entry.keyInsights.length > 0 ? (
              <ul className="space-y-1.5">
                {entry.keyInsights.map((insight, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="leading-snug">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 bg-[#18181B]/50 border border-dashed border-[#27272A] rounded-xl text-xs text-zinc-500 italic">
                Key takeaways and reframes will appear here as dialogue deepens.
              </div>
            )}
          </div>

          {/* Suggested Follow-up Inquiries */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Suggested Deepening Questions</span>
            </div>
            {entry.suggestedPrompts && entry.suggestedPrompts.length > 0 ? (
              <div className="space-y-1.5">
                {entry.suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt(prompt)}
                    disabled={isGenerating}
                    className="w-full text-left p-2.5 rounded-xl border border-[#27272A] hover:border-emerald-600/70 hover:bg-emerald-950/20 text-xs text-zinc-300 hover:text-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-[#18181B]/50 border border-dashed border-[#27272A] rounded-xl text-xs text-zinc-500 italic">
                Proactive inquiry questions will be generated after each reflection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Cognitive Bias & Blind-Spot Radar */}
      {activeTab === 'radar' && (
        <div className="pt-1">
          <CognitiveRadarView
            data={entry.cognitiveRadar}
            isGenerating={isGenerating}
          />
        </div>
      )}

      {/* Tab Content 3: Mood & Emotional Resonance Tracking */}
      {activeTab === 'resonance' && (
        <div className="pt-1">
          <EmotionalResonanceView
            data={entry.emotionalResonance}
            isGenerating={isGenerating}
          />
        </div>
      )}
    </div>
  );
};

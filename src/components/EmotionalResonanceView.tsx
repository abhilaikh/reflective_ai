import React from 'react';
import { Activity, Zap, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { EmotionalResonanceData } from '../types';

interface EmotionalResonanceViewProps {
  data?: EmotionalResonanceData;
  isGenerating?: boolean;
}

export const EmotionalResonanceView: React.FC<EmotionalResonanceViewProps> = ({
  data,
  isGenerating,
}) => {
  if (!data || !data.metrics || data.metrics.length === 0) {
    return (
      <div className="p-6 bg-[#18181B]/50 border border-dashed border-[#27272A] rounded-2xl text-center">
        <Activity className="w-8 h-8 mx-auto text-zinc-600 mb-2 stroke-1" />
        <h4 className="text-xs font-semibold text-zinc-300">Awaiting Emotional Signal</h4>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px] mx-auto">
          {isGenerating
            ? 'Gemini is measuring emotional resonance and clarity...'
            : 'Add a thought or dialogue turn to track emotional resonance over time.'}
        </p>
      </div>
    );
  }

  // Energy color mapping
  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'High':
        return 'bg-amber-950/60 border-amber-800/60 text-amber-400';
      case 'Elevated':
        return 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400';
      case 'Moderate':
        return 'bg-indigo-950/60 border-indigo-800/60 text-indigo-400';
      case 'Low':
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  // Trait color mapping
  const getTraitColor = (trait: string) => {
    switch (trait.toLowerCase()) {
      case 'clarity':
        return 'bg-indigo-500';
      case 'calm':
        return 'bg-emerald-500';
      case 'optimism':
        return 'bg-amber-500';
      case 'agency':
        return 'bg-sky-500';
      default:
        return 'bg-violet-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Tone & Energy Header */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emotional Resonance</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${getEnergyColor(
              data.energyLevel
            )}`}
          >
            <Zap className="w-2.5 h-2.5" />
            {data.energyLevel} Energy
          </span>
        </div>

        {/* Primary Tone Showcase */}
        <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">
              Identified Tone
            </span>
            <span className="text-sm font-medium text-zinc-200">
              {data.primaryTone}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">
              Valence Score
            </span>
            <span className="text-sm font-mono font-semibold text-emerald-400">
              {data.valenceScore}%
            </span>
          </div>
        </div>

        {/* Valence Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Emotional Friction</span>
            <span>Clarity &amp; Ease</span>
          </div>
          <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden p-0.5 border border-[#27272A]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${data.valenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4-Spectrum Trait Progress Meters */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Inner State Spectrum
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">0 &rarr; 100</span>
        </div>

        <div className="space-y-2.5">
          {data.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-medium">{metric.trait}</span>
                <span className="text-zinc-400 font-mono text-[10px]">
                  {metric.score}%
                </span>
              </div>
              <div className="w-full bg-[#121214] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getTraitColor(
                    metric.trait
                  )} transition-all duration-500`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalance Guidance Card */}
      {data.resonanceNote && (
        <div className="p-3.5 bg-emerald-950/25 border border-emerald-800/40 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resonance Guidance</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {data.resonanceNote}
          </p>
        </div>
      )}
    </div>
  );
};

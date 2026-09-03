import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Brain, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { CognitiveRadarData } from '../types';

interface CognitiveRadarViewProps {
  data?: CognitiveRadarData;
  isGenerating?: boolean;
}

export const CognitiveRadarView: React.FC<CognitiveRadarViewProps> = ({
  data,
  isGenerating,
}) => {
  if (!data || !data.dimensions || data.dimensions.length === 0) {
    return (
      <div className="p-6 bg-[#18181B]/50 border border-dashed border-[#27272A] rounded-2xl text-center">
        <Brain className="w-8 h-8 mx-auto text-zinc-600 mb-2 stroke-1" />
        <h4 className="text-xs font-semibold text-zinc-300">Awaiting Reflection Dialogue</h4>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px] mx-auto">
          {isGenerating
            ? 'Gemini is analyzing cognitive tendencies & thought patterns...'
            : 'Submit your first reflection to map cognitive biases & blind-spots on the radar.'}
        </p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.dimensions.map((dim) => ({
    dimension: dim.name,
    score: dim.score,
    description: dim.description || '',
  }));

  return (
    <div className="space-y-4">
      {/* Radar Chart Container */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Cognitive Habit Radar</span>
          </div>
          {data.dominantPattern && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-400 font-medium">
              Primary: {data.dominantPattern}
            </span>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 mb-2">
          Mapping subconscious cognitive habits across 6 thinking dimensions (0 = absent, 100 = strong tendency).
        </p>

        <div className="w-full h-56 -my-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#27272A" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#3F3F46"
                tick={{ fill: '#71717A', fontSize: 9 }}
              />
              <Radar
                name="Tendency"
                dataKey="score"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.3}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-2 text-xs shadow-xl">
                        <p className="font-semibold text-zinc-200">{item.dimension}</p>
                        <p className="text-amber-400 font-mono text-[11px]">
                          Intensity: {item.score} / 100
                        </p>
                        {item.description && (
                          <p className="text-[10px] text-zinc-400 mt-1 max-w-[180px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Socratic Reframe & Compassionate Guidance */}
      {data.reframeInsight && (
        <div className="p-3.5 bg-indigo-950/25 border border-indigo-800/40 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Blind-Spot Reframe</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {data.reframeInsight}
          </p>
        </div>
      )}

      {/* Individual Tendency Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          <span>Dimension Breakdown</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-2 bg-[#18181B] border border-[#27272A] rounded-xl text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-medium truncate pr-1">{dim.name}</span>
                <span className="font-mono text-zinc-400 text-[10px]">{dim.score}%</span>
              </div>
              <div className="w-full bg-[#121214] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dim.score}%`,
                    backgroundColor:
                      dim.score > 60
                        ? '#F59E0B'
                        : dim.score > 35
                        ? '#818CF8'
                        : '#10B981',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

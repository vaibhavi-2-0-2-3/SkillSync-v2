import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DeveloperAnalysis } from '../services/api';

interface LeetCodeHeatmapProps {
  analysis: DeveloperAnalysis | null;
  isLoading: boolean;
}

const LeetCodeHeatmap: React.FC<LeetCodeHeatmapProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <div className="h-4 w-40 rounded bg-slate-800 animate-pulse" />
        <div className="h-40 rounded bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const lc = analysis.leetcodeSummary;
  if (!lc) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
        No LeetCode data available. Sync your LeetCode stats to visualize problem distribution.
      </div>
    );
  }

  const data = [
    { name: 'Easy', value: lc.solvedByDifficulty.easy, color: '#22c55e' },
    { name: 'Medium', value: lc.solvedByDifficulty.medium, color: '#f97316' },
    { name: 'Hard', value: lc.solvedByDifficulty.hard, color: '#e11d48' }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-100">LeetCode distribution</h2>
        <p className="text-xs text-slate-400">{lc.totalSolved} problems solved</p>
      </div>
      <div className="h-44">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#cbd5f5', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'rgba(15,23,42,0.6)' }}
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                fontSize: '0.75rem'
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!!lc.weakDifficulties.length && (
        <p className="text-xs text-slate-300">
          Weak difficulties:{' '}
          <span className="text-rose-300 font-medium">
            {lc.weakDifficulties.join(', ')}
          </span>
        </p>
      )}
    </div>
  );
};

export default LeetCodeHeatmap;



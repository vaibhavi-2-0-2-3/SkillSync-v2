import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DeveloperAnalysis } from '../services/api';

interface GitHubAnalyticsProps {
  analysis: DeveloperAnalysis | null;
  isLoading: boolean;
}

const COLORS = ['#38bdf8', '#22c55e', '#f97316', '#e11d48', '#a855f7', '#0ea5e9', '#facc15'];

const GitHubAnalytics: React.FC<GitHubAnalyticsProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <div className="h-4 w-36 rounded bg-slate-800 animate-pulse" />
        <div className="h-40 rounded bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const summary = analysis.githubSummary;
  if (!summary) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
        No GitHub data available. Connect your GitHub account to see analytics.
      </div>
    );
  }

  const languagesData = Object.entries(summary.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-100">GitHub analytics</h2>
        <p className="text-xs text-slate-400">
          {summary.totalRepos} repos • {summary.totalCommits} commits (approx)
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-44">
          {languagesData.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={languagesData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  innerRadius={30}
                  stroke="#020617"
                  animationDuration={700}
                >
                  {languagesData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">No language data available.</p>
          )}
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <p className="font-semibold text-slate-300 mb-1">Top languages</p>
            <div className="flex flex-wrap gap-1">
              {summary.dominantLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-300 mb-1">Dominant stack</p>
            <div className="flex flex-wrap gap-1">
              {summary.dominantStack.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200"
                >
                  {item}
                </span>
              ))}
              {!summary.dominantStack.length && (
                <span className="text-slate-400">Not enough data to infer</span>
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-300 mb-1">Commit activity</p>
            <p className="text-slate-300">
              Commit frequency score:{' '}
              <span className="font-semibold text-emerald-400">
                {summary.commitFrequencyScore}/5
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubAnalytics;



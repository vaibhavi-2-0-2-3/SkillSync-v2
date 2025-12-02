import React from 'react';
import { AIInsights } from '../services/api';

interface AIRoadmapProps {
  insights: AIInsights | null;
  isLoading: boolean;
  onRegenerate?: () => void;
  role: string;
}

const AIRoadmap: React.FC<AIRoadmapProps> = ({ insights, isLoading, onRegenerate, role }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-slate-100">AI Roadmap</h2>
          <p className="text-xs text-slate-400">Role-targeted weekly plan and gaps for {role}</p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Refresh'}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="h-4 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 rounded bg-slate-800 animate-pulse" />
        </div>
      )}

      {!isLoading && !insights && (
        <p className="text-xs text-slate-400">
          Generate your roadmap to see a week-by-week breakdown aligned with your target role.
        </p>
      )}

      {!isLoading && insights && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-300 mb-1">Weekly roadmap</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-200">
              {insights.roadmap.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-300 mb-1">Skill gaps</p>
              <div className="flex flex-wrap gap-1">
                {insights.skillGaps.map((gap) => (
                  <span
                    key={gap}
                    className="inline-flex items-center rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200"
                  >
                    {gap}
                  </span>
                ))}
                {!insights.skillGaps.length && <span className="text-slate-400">None detected</span>}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">Recommended skills</p>
              <div className="flex flex-wrap gap-1">
                {insights.recommendedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
                {!insights.recommendedSkills.length && (
                  <span className="text-slate-400">No additional recommendations</span>
                )}
              </div>
            </div>
          </div>
          {insights.seniorFeedback && (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-200">
              <p className="font-semibold text-slate-300 mb-1">Senior engineer feedback</p>
              <p>{insights.seniorFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRoadmap;



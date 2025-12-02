import React from 'react';
import { CompanyMatch } from '../services/api';

interface CompanyFitProps {
  matches: CompanyMatch[] | null;
  isLoading: boolean;
}

const CompanyFit: React.FC<CompanyFitProps> = ({ matches, isLoading }) => {
  if (isLoading || !matches) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <div className="h-4 w-40 rounded bg-slate-800 animate-pulse" />
        <div className="h-24 rounded bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
        No company matches available yet. Ensure your analysis has detected skills and try again.
      </div>
    );
  }

  const topThree = new Set(matches.slice(0, 3).map((m) => m.company + m.role));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-100">Company fit</h2>
        <p className="text-xs text-slate-400">Best matches based on your current skill graph</p>
      </div>
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-slate-400 text-[11px] border-b border-slate-800">
              <th className="py-2 pr-4 text-left font-medium">Company</th>
              <th className="py-2 pr-4 text-left font-medium">Role</th>
              <th className="py-2 pr-4 text-left font-medium">Fit</th>
              <th className="py-2 pr-4 text-left font-medium">Matched skills</th>
              <th className="py-2 text-left font-medium">Missing skills</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const key = m.company + m.role;
              const isTop = topThree.has(key);
              return (
                <tr
                  key={key}
                  className={`border-b border-slate-800/60 ${
                    isTop ? 'bg-emerald-500/5' : 'hover:bg-slate-900/80'
                  }`}
                >
                  <td className="py-2 pr-4 align-top">
                    <span className="font-medium text-slate-100">{m.company}</span>
                  </td>
                  <td className="py-2 pr-4 align-top text-slate-200">{m.role}</td>
                  <td className="py-2 pr-4 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        m.fitScore >= 75
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : m.fitScore >= 50
                          ? 'bg-sky-500/15 text-sky-300'
                          : 'bg-slate-700/60 text-slate-200'
                      }`}
                    >
                      {m.fitScore}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {m.matchedSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                      {!m.matchedSkills.length && <span className="text-slate-400">None</span>}
                    </div>
                  </td>
                  <td className="py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {m.missingCompanySkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200"
                        >
                          {s}
                        </span>
                      ))}
                      {!m.missingCompanySkills.length && (
                        <span className="text-slate-400">Fully covered</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyFit;



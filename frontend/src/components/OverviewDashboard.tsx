import React from 'react';
import { AIInsights, DeveloperAnalysis } from '../services/api';

interface OverviewDashboardProps {
  analysis: DeveloperAnalysis | null;
  aiInsights: AIInsights | null;
  isLoading: boolean;
}

const StatCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label,
  value,
  accent
}) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className={`text-2xl font-semibold ${accent ?? 'text-slate-50'}`}>{value}</p>
  </div>
);

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ analysis, aiInsights, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const totalSkills = analysis.detectedSkills.length;
  const strongAreas = analysis.strongAreas.length;
  const weakAreas = analysis.weakAreas.length;
  const jobReadiness = aiInsights?.readinessScore ?? 0;

  const githubRepos = analysis.githubSummary?.totalRepos ?? 0;
  const githubCommits = analysis.githubSummary?.totalCommits ?? 0;
  const totalSolved = analysis.leetcodeSummary?.totalSolved ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Job readiness" value={`${jobReadiness}/100`} accent="text-emerald-400" />
      <StatCard label="Detected skills" value={totalSkills} accent="text-sky-400" />
      <StatCard label="Strong areas" value={strongAreas} accent="text-indigo-400" />
      <StatCard label="Weak areas" value={weakAreas} accent="text-rose-400" />
      <StatCard label="GitHub repos" value={githubRepos} />
      <StatCard label="Total commits (approx)" value={githubCommits} />
      <StatCard label="LeetCode solved" value={totalSolved} />
      <StatCard
        label="LinkedIn skills"
        value={analysis.linkedinSummary?.skills.length ?? 0}
      />
    </div>
  );
};

export default OverviewDashboard;



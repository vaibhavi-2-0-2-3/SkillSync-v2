import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  AIInsights,
  CompanyMatch,
  DeveloperAnalysis,
  fetchAIInsights,
  fetchAnalysis,
  fetchCompanyMatches,
  refreshUserData
} from '../services/api';
import OverviewDashboard from '../components/OverviewDashboard';
import SkillGraph from '../components/SkillGraph';
import AIRoadmap from '../components/AIRoadmap';
import CompanyFit from '../components/CompanyFit';
import GitHubAnalytics from '../components/GitHubAnalytics';
import LeetCodeHeatmap from '../components/LeetCodeHeatmap';
import Toast from '../components/Toast';

const Dashboard: React.FC = () => {
  const { userId, role, setRole, setUserId } = useUser();

  const [analysis, setAnalysis] = useState<DeveloperAnalysis | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[] | null>(null);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const canFetch = Boolean(userId);

  useEffect(() => {
    if (!canFetch) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingAnalysis(true);
        setError(null);
        const data = await fetchAnalysis(userId!);
        if (!cancelled) {
          setAnalysis(data);
          setLastSyncedAt(new Date());
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load analysis');
        }
      } finally {
        if (!cancelled) setLoadingAnalysis(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [canFetch, userId]);

  useEffect(() => {
    if (!canFetch) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingCompanies(true);
        const data = await fetchCompanyMatches(userId!);
        if (!cancelled) {
          setAnalysis(data.analysis);
          setCompanyMatches(data.matches);
        }
      } catch {
        if (!cancelled) {
          // company match is non-critical; surface soft error in UI section if needed
        }
      } finally {
        if (!cancelled) setLoadingCompanies(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [canFetch, userId]);

  const handleGenerateAI = async () => {
    if (!userId) return;
    try {
      setLoadingAI(true);
      const insights = await fetchAIInsights(userId, role);
      setAIInsights(insights);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!userId) return;
    try {
      setRefreshing(true);
      setError(null);
      const result = await refreshUserData(userId, role);
      setAnalysis(result.analysis);
      setAIInsights(result.aiInsights);
      setCompanyMatches(result.companyMatches);
      setLastSyncedAt(new Date());
      setToast({ message: 'Data refreshed successfully', type: 'success' });
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to refresh data';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (canFetch) {
      handleGenerateAI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch]);

  const readiness = aiInsights?.readinessScore ?? 0;

  const headerTitle = useMemo(
    () => (role ? `SkillSync · ${role}` : 'SkillSync dashboard'),
    [role]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">
              SkillSync
            </span>
            <h1 className="text-lg font-semibold text-slate-50">{headerTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            {lastSyncedAt && (
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="text-slate-400">Last synced</span>
                <span className="text-slate-300">
                  {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="text-slate-400">Job readiness</span>
              <span className="font-semibold text-emerald-400">{readiness}/100</span>
            </div>
            <button
              onClick={handleForceRefresh}
              disabled={!userId || refreshing}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 text-xs text-slate-200 hover:bg-slate-800 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Force Refresh'}
            </button>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Target role (e.g. Backend Developer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-40 sm:w-56 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <input
                type="text"
                placeholder="User ID"
                defaultValue={userId ?? ''}
                onBlur={(e) => e.target.value && setUserId(e.target.value.trim())}
                className="w-32 sm:w-40 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        {!userId && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
            No user selected. After completing GitHub OAuth, you&apos;ll be redirected here with
            your <code className="px-1 py-0.5 rounded bg-slate-800">userId</code> in the URL. You
            can also paste a known <code className="px-1 py-0.5 rounded bg-slate-800">userId</code>{' '}
            above.
          </div>
        )}

        <section>
          <OverviewDashboard
            analysis={analysis}
            aiInsights={aiInsights}
            isLoading={loadingAnalysis || loadingAI}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SkillGraph analysis={analysis} isLoading={loadingAnalysis} />
          </div>
          <div className="lg:col-span-1">
            <AIRoadmap
              insights={aiInsights}
              isLoading={loadingAI}
              onRegenerate={handleGenerateAI}
              role={role}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GitHubAnalytics analysis={analysis} isLoading={loadingAnalysis} />
          <LeetCodeHeatmap analysis={analysis} isLoading={loadingAnalysis} />
        </section>

        <section>
          <CompanyFit matches={companyMatches} isLoading={loadingCompanies} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;



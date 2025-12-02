export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GithubSummary {
  totalRepos: number;
  languages: Record<string, number>;
  dominantLanguages: string[];
  dominantStack: string[];
  frameworksAndLibraries: string[];
  commitFrequencyScore: number;
  totalCommits: number;
  reposAnalyzedForCommits: number;
}

export interface LeetCodeSummary {
  totalSolved: number;
  solvedByDifficulty: Record<DifficultyLevel, number>;
  weakDifficulties: DifficultyLevel[];
  weakTopics: string[];
}

export interface LinkedInSummary {
  skills: string[];
  normalizedSkills: string[];
}

export interface DeveloperAnalysis {
  detectedSkills: string[];
  strongAreas: string[];
  weakAreas: string[];
  missingSkills: string[];
  githubSummary: GithubSummary | null;
  leetcodeSummary: LeetCodeSummary | null;
  linkedinSummary: LinkedInSummary | null;
}

export interface AIInsights {
  roadmap: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  readinessScore: number;
  updatedAt: string;
  role?: string;
  seniorFeedback?: string;
}

export interface CompanyMatch {
  company: string;
  role: string;
  fitScore: number;
  missingCompanySkills: string[];
  matchedSkills: string[];
}

// Use environment variable for API base URL, fallback to relative path for dev
const API_BASE = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
}

export async function fetchAnalysis(userId: string): Promise<DeveloperAnalysis> {
  const res = await fetch(`${API_BASE}/analyze/${encodeURIComponent(userId)}`);
  return handleJson<DeveloperAnalysis>(res);
}

export async function fetchAIInsights(userId: string, role: string): Promise<AIInsights> {
  const res = await fetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role })
  });
  const data = await handleJson<{ aiInsights: AIInsights }>(res);
  return data.aiInsights;
}

export async function fetchCompanyMatches(
  userId: string
): Promise<{ analysis: DeveloperAnalysis; matches: CompanyMatch[] }> {
  const res = await fetch(`${API_BASE}/company-match/${encodeURIComponent(userId)}`);
  return handleJson<{ analysis: DeveloperAnalysis; matches: CompanyMatch[] }>(res);
}

export interface RefreshResponse {
  message: string;
  analysis: DeveloperAnalysis;
  aiInsights: AIInsights;
  companyMatches: CompanyMatch[];
}

export async function refreshUserData(
  userId: string,
  role?: string
): Promise<RefreshResponse> {
  const res = await fetch(`${API_BASE}/refresh/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return handleJson<RefreshResponse>(res);
}



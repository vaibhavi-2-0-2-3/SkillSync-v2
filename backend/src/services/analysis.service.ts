import { IUser, User } from '../models/User';
import { fetchUserRepos, fetchLanguageStats, fetchCommitStats } from './github.service';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GithubSummary {
  totalRepos: number;
  languages: Record<string, number>;
  dominantLanguages: string[];
  dominantStack: string[];
  frameworksAndLibraries: string[];
  commitFrequencyScore: number; // 1–5
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

const FRAMEWORK_KEYWORDS = [
  'react',
  'next',
  'vue',
  'angular',
  'svelte',
  'node',
  'express',
  'nestjs',
  'django',
  'flask',
  'spring',
  'laravel',
  'rails',
  'tailwind',
  'bootstrap',
  'graphql',
  'redux',
  'mobx',
  'prisma'
];

const SKILL_KEYWORDS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c++',
  'go',
  'react',
  'node',
  'express',
  'mongodb',
  'postgresql',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'graphql',
  'rest',
  'dsa',
  'algorithms',
  'system design'
];

function normalizeSkillName(skill: string): string {
  return skill.trim().toLowerCase();
}

function keywordMatch(text: string, dictionary: string[]): string[] {
  const lower = text.toLowerCase();
  const matches = new Set<string>();
  dictionary.forEach((kw) => {
    if (lower.includes(kw.toLowerCase())) {
      matches.add(kw.toLowerCase());
    }
  });
  return Array.from(matches);
}

function computeDominantLanguages(languageTotals: Record<string, number>): string[] {
  const entries = Object.entries(languageTotals);
  if (!entries.length) return [];
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 3).map(([lang]) => lang);
  return top;
}

function deriveStackFromLanguagesAndFrameworks(
  dominantLanguages: string[],
  frameworks: string[]
): string[] {
  const stack = new Set<string>();

  const langs = dominantLanguages.map((l) => l.toLowerCase());
  const fw = frameworks.map((f) => f.toLowerCase());

  if (langs.includes('typescript') || langs.includes('javascript')) {
    if (fw.includes('react') || fw.includes('next')) {
      stack.add('react');
    }
    if (fw.includes('node') || fw.includes('express')) {
      stack.add('node.js');
    }
  }

  if (langs.includes('python')) {
    if (fw.includes('django')) stack.add('django');
    if (fw.includes('flask')) stack.add('flask');
  }

  if (langs.includes('java') && fw.includes('spring')) {
    stack.add('spring');
  }

  if (fw.includes('tailwind')) stack.add('tailwindcss');

  return Array.from(stack);
}

function scoreCommitFrequency(totalCommits: number): number {
  if (totalCommits === 0) return 1;
  if (totalCommits < 50) return 2;
  if (totalCommits < 200) return 3;
  if (totalCommits < 500) return 4;
  return 5;
}

async function analyzeGithub(user: IUser): Promise<GithubSummary | null> {
  if (!user.githubAccessToken) return null;

  const [repos, languageTotals, commitStats] = await Promise.all([
    fetchUserRepos(user),
    fetchLanguageStats(user),
    fetchCommitStats(user)
  ]);

  const dominantLanguages = computeDominantLanguages(languageTotals);

  const allText = repos
    .map((r: any) => {
      const name = r.name || '';
      const description = r.description || '';
      const topics = Array.isArray(r.topics) ? r.topics.join(' ') : '';
      return `${name} ${description} ${topics}`;
    })
    .join(' ');

  const frameworksAndLibraries = keywordMatch(allText, FRAMEWORK_KEYWORDS);
  const dominantStack = deriveStackFromLanguagesAndFrameworks(dominantLanguages, frameworksAndLibraries);

  const totalCommits = commitStats.totalCommits ?? 0;
  const commitFrequencyScore = scoreCommitFrequency(totalCommits);

  return {
    totalRepos: repos.length,
    languages: languageTotals,
    dominantLanguages,
    dominantStack,
    frameworksAndLibraries,
    commitFrequencyScore,
    totalCommits,
    reposAnalyzedForCommits: commitStats.reposAnalyzed ?? 0
  };
}

function analyzeLeetCode(raw: any): LeetCodeSummary | null {
  if (!raw) return null;

  const easy = Number(raw.easySolved ?? raw.totalEasy ?? 0);
  const medium = Number(raw.mediumSolved ?? raw.totalMedium ?? 0);
  const hard = Number(raw.hardSolved ?? raw.totalHard ?? 0);
  const totalSolved = Number(raw.totalSolved ?? easy + medium + hard);

  const solvedByDifficulty: Record<DifficultyLevel, number> = {
    easy,
    medium,
    hard
  };

  const weakDifficulties: DifficultyLevel[] = [];
  const maxSolved = Math.max(easy, medium, hard);
  if (maxSolved > 0) {
    (['easy', 'medium', 'hard'] as DifficultyLevel[]).forEach((diff) => {
      if (solvedByDifficulty[diff] < maxSolved * 0.3) {
        weakDifficulties.push(diff);
      }
    });
  }

  const weakTopics: string[] = [];
  const topicStats = raw.tagStats || raw.topicStats || raw.tagProblemCounts || [];
  if (Array.isArray(topicStats)) {
    const threshold = 5;
    topicStats.forEach((t: any) => {
      const count = Number(t.solved ?? t.problemsSolved ?? t.count ?? 0);
      if (count > 0 && count < threshold && typeof t.name === 'string') {
        weakTopics.push(t.name);
      }
    });
  }

  return {
    totalSolved,
    solvedByDifficulty,
    weakDifficulties,
    weakTopics
  };
}

function analyzeLinkedInSkills(skills: string[] | undefined | null): LinkedInSummary | null {
  if (!skills || !skills.length) return null;
  const normalized = skills.map((s) => normalizeSkillName(s));
  return {
    skills,
    normalizedSkills: Array.from(new Set(normalized))
  };
}

function inferDetectedSkills(
  githubSummary: GithubSummary | null,
  leetcodeSummary: LeetCodeSummary | null,
  linkedinSummary: LinkedInSummary | null
): string[] {
  const skills = new Set<string>();

  if (githubSummary) {
    Object.keys(githubSummary.languages).forEach((lang) => skills.add(normalizeSkillName(lang)));
    githubSummary.frameworksAndLibraries.forEach((fw) => skills.add(normalizeSkillName(fw)));
    githubSummary.dominantStack.forEach((s) => skills.add(normalizeSkillName(s)));
  }

  if (leetcodeSummary && leetcodeSummary.totalSolved > 0) {
    skills.add('dsa');
    skills.add('algorithms');
  }

  if (linkedinSummary) {
    linkedinSummary.normalizedSkills.forEach((s) => skills.add(s));
  }

  return Array.from(skills);
}

function inferStrongAndWeakAreas(
  githubSummary: GithubSummary | null,
  leetcodeSummary: LeetCodeSummary | null,
  linkedinSummary: LinkedInSummary | null
): { strongAreas: string[]; weakAreas: string[]; missingSkills: string[] } {
  const strong = new Set<string>();
  const weak = new Set<string>();

  // Strong from GitHub
  if (githubSummary) {
    githubSummary.dominantLanguages.forEach((lang) => strong.add(normalizeSkillName(lang)));
    githubSummary.dominantStack.forEach((s) => strong.add(normalizeSkillName(s)));
    if (githubSummary.commitFrequencyScore >= 4) {
      strong.add('consistent-commit-activity');
    }
  }

  // Weak from LeetCode difficulty and topics
  if (leetcodeSummary) {
    leetcodeSummary.weakDifficulties.forEach((d) => weak.add(`leetcode-${d}`));
    leetcodeSummary.weakTopics.forEach((t) => weak.add(`dsa-${normalizeSkillName(t)}`));
  }

  // Cross-check LinkedIn vs GitHub/LeetCode for missing skills
  const baselineSkills = new Set(SKILL_KEYWORDS.map((s) => s.toLowerCase()));
  const detected = inferDetectedSkills(githubSummary, leetcodeSummary, linkedinSummary);
  const detectedSet = new Set(detected);

  const missing: string[] = [];
  baselineSkills.forEach((skill) => {
    if (!detectedSet.has(skill)) {
      missing.push(skill);
    }
  });

  return {
    strongAreas: Array.from(strong),
    weakAreas: Array.from(weak),
    missingSkills: missing
  };
}

export async function analyzeUser(user: IUser): Promise<DeveloperAnalysis> {
  const githubSummary = await analyzeGithub(user);
  const leetcodeSummary = analyzeLeetCode(user.leetcodeRaw);
  const linkedinSummary = analyzeLinkedInSkills(user.linkedinSkills);

  const detectedSkills = inferDetectedSkills(githubSummary, leetcodeSummary, linkedinSummary);
  const { strongAreas, weakAreas, missingSkills } = inferStrongAndWeakAreas(
    githubSummary,
    leetcodeSummary,
    linkedinSummary
  );

  return {
    detectedSkills,
    strongAreas,
    weakAreas,
    missingSkills,
    githubSummary,
    leetcodeSummary,
    linkedinSummary
  };
}

export async function analyzeAndPersistUser(userId: string): Promise<DeveloperAnalysis | null> {
  const user = await User.findById(userId);
  if (!user) return null;

  const analysis = await analyzeUser(user);
  user.analysis = analysis;
  await user.save();

  return analysis;
}



import { IUser } from '../models/User';
import { DeveloperAnalysis } from './analysis.service';

export interface AIEngineOutput {
  roadmap: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  jobReadinessScore: number; // 0–100
  seniorFeedback: string;
}

export interface PersistedAIInsights {
  roadmap: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  readinessScore: number;
  updatedAt: Date;
  role?: string;
  seniorFeedback?: string;
}

function mockCallLLM(_analysis: DeveloperAnalysis, _role: string): AIEngineOutput {
  // Placeholder: this is where you'll later plug in OpenAI / Gemini.
  // For now, we derive some simple heuristics from the analysis and return deterministic data.
  const strongSample = _analysis.strongAreas.slice(0, 3);
  const weakSample = _analysis.weakAreas.slice(0, 3);
  const missingSample = _analysis.missingSkills.slice(0, 5);

  const roadmap: string[] = [];

  if (missingSample.length) {
    roadmap.push(`Focus on acquiring foundational skills: ${missingSample.join(', ')}.`);
  }
  if (weakSample.length) {
    roadmap.push(`Deepen knowledge in weak areas: ${weakSample.join(', ')} via targeted practice and projects.`);
  }
  if (strongSample.length) {
    roadmap.push(`Leverage strong areas (${strongSample.join(', ')}) to build portfolio projects aligned with your target role.`);
  }
  if (!roadmap.length) {
    roadmap.push('You have a balanced profile. Continue building real-world projects and preparing for interviews.');
  }

  const recommendedSkills = Array.from(new Set([...weakSample, ...missingSample])).slice(0, 10);
  const skillGaps = recommendedSkills;

  const baseScore = 40;
  const strongBoost = Math.min(_analysis.strongAreas.length * 4, 20);
  const solvedBoost = _analysis.leetcodeSummary?.totalSolved
    ? Math.min(_analysis.leetcodeSummary.totalSolved / 10, 20)
    : 0;
  const commitBoost = _analysis.githubSummary
    ? (_analysis.githubSummary.commitFrequencyScore || 0) * 4
    : 0;

  const jobReadinessScore = Math.max(
    0,
    Math.min(100, Math.round(baseScore + strongBoost + solvedBoost + commitBoost - missingSample.length * 2))
  );

  const seniorFeedback =
    'Based on your current profile, double down on your strongest technologies while deliberately closing the most ' +
    'critical gaps for your target role. Prioritize one or two high-impact projects that showcase real-world problem ' +
    'solving, and align your interview prep with the patterns and technologies you use most often.';

  return {
    roadmap,
    skillGaps,
    recommendedSkills,
    jobReadinessScore,
    seniorFeedback
  };
}

export async function generateAnalysisWithAI(
  userAnalysis: DeveloperAnalysis,
  role: string
): Promise<AIEngineOutput> {
  // In the future, replace mockCallLLM with a real OpenAI / Gemini call.
  return mockCallLLM(userAnalysis, role);
}

export async function generateAndPersistAIInsights(
  user: IUser,
  analysis: DeveloperAnalysis,
  role: string
): Promise<PersistedAIInsights> {
  const aiOutput = await generateAnalysisWithAI(analysis, role);

  const now = new Date();
  const insights: PersistedAIInsights = {
    roadmap: aiOutput.roadmap,
    skillGaps: aiOutput.skillGaps,
    recommendedSkills: aiOutput.recommendedSkills,
    readinessScore: aiOutput.jobReadinessScore,
    updatedAt: now,
    role,
    seniorFeedback: aiOutput.seniorFeedback
  };

  user.aiInsights = insights;
  await user.save();

  return insights;
}



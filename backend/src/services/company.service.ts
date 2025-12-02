import { User, IUser } from '../models/User';
import companies from '../data/companies.json';
import { DeveloperAnalysis } from './analysis.service';

export interface CompanyProfile {
  company: string;
  role: string;
  skills: string[];
}

export interface CompanyMatch {
  company: string;
  role: string;
  fitScore: number; // 0–100
  missingCompanySkills: string[];
  matchedSkills: string[];
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function getCompanies(): CompanyProfile[] {
  return companies.map((c) => ({
    company: c.company,
    role: c.role,
    skills: c.skills
  }));
}

export function computeCompanyFit(
  userDetectedSkills: string[],
  companyProfile: CompanyProfile
): CompanyMatch {
  const userSkillsSet = new Set(userDetectedSkills.map(normalizeSkill));
  const companySkillsNormalized = companyProfile.skills.map(normalizeSkill);

  const matchedSkills = companySkillsNormalized.filter((s) => userSkillsSet.has(s));
  const missingCompanySkills = companySkillsNormalized.filter((s) => !userSkillsSet.has(s));

  const total = companySkillsNormalized.length || 1;
  const fitScore = Math.round((matchedSkills.length / total) * 100);

  return {
    company: companyProfile.company,
    role: companyProfile.role,
    fitScore,
    missingCompanySkills,
    matchedSkills
  };
}

export async function matchUserToCompanies(
  userId: string,
  analysis: DeveloperAnalysis
): Promise<CompanyMatch[]> {
  const user = await User.findById(userId) as IUser | null;
  if (!user) {
    return [];
  }

  const detectedSkills = (analysis.detectedSkills || []).map(normalizeSkill);
  const profiles = getCompanies();

  const matches = profiles.map((p) => computeCompanyFit(detectedSkills, p));

  // Sort by fitScore descending
  matches.sort((a, b) => b.fitScore - a.fitScore);

  return matches;
}



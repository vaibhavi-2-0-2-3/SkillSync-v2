import { IUser, User } from '../models/User';
import { fetchUserRepos, fetchLanguageStats, fetchCommitStats } from './github.service';
import { syncLeetCodeForUser } from './leetcode.service';
import { saveLinkedInSkills } from './linkedin.service';
import { analyzeAndPersistUser, DeveloperAnalysis } from './analysis.service';
import { generateAndPersistAIInsights, PersistedAIInsights } from './ai.service';
import { matchUserToCompanies, CompanyMatch } from './company.service';
import { logger } from '../utils/logger';

/**
 * Sync GitHub data for a user (repos, languages, commits)
 */
export async function syncUserGitHub(user: IUser): Promise<void> {
  if (!user.githubAccessToken) {
    logger.warn('Skipping GitHub sync: no access token', { userId: user._id, githubUsername: user.githubUsername });
    return;
  }

  try {
    logger.info('Syncing GitHub data', { userId: user._id, githubUsername: user.githubUsername });

    const repos = await fetchUserRepos(user);
    const languages = await fetchLanguageStats(user);
    const commits = await fetchCommitStats(user);

    // Update user with fresh GitHub raw data
    user.githubRaw = {
      repos,
      languages,
      commits,
      syncedAt: new Date()
    };

    await user.save();
    logger.info('GitHub sync completed', { userId: user._id, reposCount: repos.length });
  } catch (error) {
    logger.error('GitHub sync failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Sync LeetCode stats for a user
 */
export async function syncUserLeetCode(user: IUser): Promise<void> {
  if (!user.leetcodeUsername) {
    logger.warn('Skipping LeetCode sync: no username', { userId: user._id });
    return;
  }

  try {
    logger.info('Syncing LeetCode data', { userId: user._id, leetcodeUsername: user.leetcodeUsername });

    await syncLeetCodeForUser(String(user._id), user.leetcodeUsername);

    logger.info('LeetCode sync completed', { userId: user._id });
  } catch (error) {
    logger.error('LeetCode sync failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Sync LinkedIn skills for a user (re-merge existing payload if available)
 */
export async function syncUserLinkedIn(user: IUser): Promise<void> {
  if (!user.linkedinSkillsRaw) {
    logger.warn('Skipping LinkedIn sync: no raw data', { userId: user._id });
    return;
  }

  try {
    logger.info('Syncing LinkedIn skills', { userId: user._id });

    await saveLinkedInSkills(String(user._id), user.linkedinSkillsRaw as any);

    logger.info('LinkedIn sync completed', { userId: user._id });
  } catch (error) {
    logger.error('LinkedIn sync failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Refresh developer analysis for a user
 */
export async function refreshDeveloperAnalysis(user: IUser): Promise<DeveloperAnalysis> {
  try {
    logger.info('Refreshing developer analysis', { userId: user._id });

    const analysis = await analyzeAndPersistUser(String(user._id));
    if (!analysis) {
      throw new Error(`Unable to generate analysis for user ${user._id}`);
    }

    // Update lastSyncedAt
    user.lastSyncedAt = new Date();
    await user.save();

    logger.info('Developer analysis refreshed', { userId: user._id });
    return analysis;
  } catch (error) {
    logger.error('Developer analysis refresh failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Refresh AI insights for a user (requires analysis to be up-to-date)
 */
export async function refreshAIInsights(user: IUser, role: string = 'Software Engineer'): Promise<void> {
  try {
    logger.info('Refreshing AI insights', { userId: user._id, role });

    // Ensure analysis exists
    let analysis = user.analysis as DeveloperAnalysis | undefined | null;
    if (!analysis) {
      analysis = await analyzeAndPersistUser(String(user._id));
    }
    if (!analysis) {
      throw new Error(`Unable to generate analysis for user ${user._id}`);
    }

    await generateAndPersistAIInsights(user, analysis, role);

    // Update lastAISyncAt
    user.lastAISyncAt = new Date();
    await user.save();

    logger.info('AI insights refreshed', { userId: user._id });
  } catch (error) {
    logger.error('AI insights refresh failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Refresh company matches for a user (requires analysis to be up-to-date)
 */
export async function refreshCompanyMatches(user: IUser): Promise<void> {
  try {
    logger.info('Refreshing company matches', { userId: user._id });

    // Ensure analysis exists
    let analysis = user.analysis as DeveloperAnalysis | undefined | null;
    if (!analysis) {
      analysis = await analyzeAndPersistUser(String(user._id));
    }
    if (!analysis) {
      throw new Error(`Unable to generate analysis for user ${user._id}`);
    }

    // Compute matches (this doesn't persist, but we update timestamp to indicate we ran it)
    await matchUserToCompanies(String(user._id), analysis);

    // Update lastCompanyMatchSyncAt
    user.lastCompanyMatchSyncAt = new Date();
    await user.save();

    logger.info('Company matches refreshed', { userId: user._id });
  } catch (error) {
    logger.error('Company matches refresh failed', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Full sync pipeline for a user: syncs all data sources, refreshes analysis, AI insights, and company matches
 */
export async function runFullSyncForUser(
  userId: string,
  role: string = 'Software Engineer'
): Promise<{
  analysis: DeveloperAnalysis;
  aiInsights: PersistedAIInsights | null;
  companyMatches: CompanyMatch[];
}> {
  const user = (await User.findById(userId)) as IUser | null;
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  logger.info('Starting full sync pipeline', { userId });

  try {
    // Step 1: Sync data sources (parallel where possible, but GitHub needs token)
    await syncUserGitHub(user);
    await syncUserLeetCode(user);
    await syncUserLinkedIn(user);

    // Step 2: Refresh analysis (depends on fresh data)
    const analysis = await refreshDeveloperAnalysis(user);

    // Step 3: Refresh AI insights and company matches (depend on analysis)
    await refreshAIInsights(user, role);
    await refreshCompanyMatches(user);

    // Reload user to get latest AI insights
    const updatedUser = (await User.findById(userId)) as IUser | null;
    const aiInsights = (updatedUser?.aiInsights as PersistedAIInsights | undefined) ?? null;

    // Get company matches
    const companyMatches = await matchUserToCompanies(userId, analysis);

    logger.info('Full sync pipeline completed', { userId });

    return {
      analysis,
      aiInsights,
      companyMatches
    };
  } catch (error) {
    logger.error('Full sync pipeline failed', { userId, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}


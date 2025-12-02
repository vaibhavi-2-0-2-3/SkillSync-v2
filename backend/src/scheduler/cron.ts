import cron from 'node-cron';
import { User, IUser } from '../models/User';
import {
  syncUserGitHub,
  syncUserLeetCode,
  syncUserLinkedIn,
  refreshDeveloperAnalysis,
  refreshAIInsights,
  refreshCompanyMatches
} from '../services/sync.service';
import { logger } from '../utils/logger';

const SYNC_DELAY_MS = 500; // 500ms delay between user syncs to avoid rate limits

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// /**
//  * Sync all active users every 6 hours
//  * Cron expression: "0 */6 * * *" = every 6 hours at minute 0
//  */
async function syncAllUsers(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting scheduled sync job for all users');

  try {
    // Find all users (active = has at least one integration)
    const users = await User.find({
      $or: [
        { githubAccessToken: { $exists: true, $ne: null } },
        { leetcodeUsername: { $exists: true, $ne: null } },
        { linkedinSkillsRaw: { $exists: true, $ne: null } }
      ]
    });

    logger.info(`Found ${users.length} active users to sync`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i] as IUser;
      const userId = String(user._id);

      try {
        logger.info(`Syncing user ${i + 1}/${users.length}`, { userId, githubUsername: user.githubUsername });

        // Sync data sources
        await syncUserGitHub(user);
        await sleep(SYNC_DELAY_MS);

        await syncUserLeetCode(user);
        await sleep(SYNC_DELAY_MS);

        await syncUserLinkedIn(user);
        await sleep(SYNC_DELAY_MS);

        // Refresh analysis
        await refreshDeveloperAnalysis(user);
        await sleep(SYNC_DELAY_MS);

        // Refresh AI insights (use existing role or default)
        const role = (user.aiInsights as any)?.role || 'Software Engineer';
        await refreshAIInsights(user, role);
        await sleep(SYNC_DELAY_MS);

        // Refresh company matches
        await refreshCompanyMatches(user);
        await sleep(SYNC_DELAY_MS);

        successCount++;
        logger.info(`User sync completed`, { userId });
      } catch (error) {
        errorCount++;
        logger.error(`User sync failed`, {
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
        // Continue with next user even if one fails
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Scheduled sync job completed', {
      totalUsers: users.length,
      successCount,
      errorCount,
      durationMs: duration
    });
  } catch (error) {
    logger.error('Scheduled sync job failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Start all cron jobs
 */
export function startCronJobs(): void {
  logger.info('Starting cron scheduler');

  // Run sync job every 6 hours: "0 */6 * * *"
  cron.schedule('0 */6 * * *', async () => {
    await syncAllUsers();
  });

  logger.info('Cron jobs started: syncAllUsers runs every 6 hours');
}


import mongoose from 'mongoose';
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
import { env } from '../config/env';

const SYNC_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCronRefresh(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting standalone cron refresh job');

  try {
    await mongoose.connect(env.mongodbUri);
    logger.info('Connected to MongoDB');

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
        logger.info(`Syncing user ${i + 1}/${users.length}`, {
          userId,
          githubUsername: user.githubUsername
        });

        await syncUserGitHub(user);
        await sleep(SYNC_DELAY_MS);

        await syncUserLeetCode(user);
        await sleep(SYNC_DELAY_MS);

        await syncUserLinkedIn(user);
        await sleep(SYNC_DELAY_MS);

        await refreshDeveloperAnalysis(user);
        await sleep(SYNC_DELAY_MS);

        const role = (user.aiInsights as any)?.role || 'Software Engineer';
        await refreshAIInsights(user, role);
        await sleep(SYNC_DELAY_MS);

        await refreshCompanyMatches(user);
        await sleep(SYNC_DELAY_MS);

        successCount++;
        logger.info('User sync completed', { userId });
      } catch (error) {
        errorCount++;
        logger.error('User sync failed', {
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Cron refresh job completed', {
      totalUsers: users.length,
      successCount,
      errorCount,
      durationMs: duration
    });
  } catch (error) {
    logger.error('Cron refresh job failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  }
}

runCronRefresh().catch((error) => {
  logger.error('Fatal error in cron refresh script', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});


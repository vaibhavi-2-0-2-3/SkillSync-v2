import app from './app';
import { env } from './config/env';
import { connectDb } from './config/db';
import { startCronJobs } from './scheduler/cron';
import { logger } from './utils/logger';

async function start() {
  await connectDb();

  // Start cron jobs only if enabled (disabled in production where Render Scheduled Jobs handle it)
  if (env.enableCron) {
    logger.info('Starting cron scheduler (ENABLE_CRON=true)');
    startCronJobs();
  } else {
    logger.info('Cron scheduler disabled (ENABLE_CRON=false). Use Render Scheduled Jobs in production.');
  }

  app.listen(env.port, () => {
    logger.info(`SkillSync API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  });
  process.exit(1);
});



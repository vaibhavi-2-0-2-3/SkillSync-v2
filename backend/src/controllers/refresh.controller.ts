import { Request, Response } from 'express';
import { runFullSyncForUser } from '../services/sync.service';
import { logger } from '../utils/logger';

export async function refreshUserData(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role?: string };

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    logger.info('Manual refresh requested', { userId, role });

    const result = await runFullSyncForUser(userId, role || 'Software Engineer');

    res.json({
      message: 'Data refreshed successfully',
      analysis: result.analysis,
      aiInsights: result.aiInsights,
      companyMatches: result.companyMatches
    });
  } catch (error) {
    logger.error('Manual refresh failed', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.params.userId
    });

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Failed to refresh user data' });
  }
}


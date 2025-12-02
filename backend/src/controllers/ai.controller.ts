import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { analyzeAndPersistUser } from '../services/analysis.service';
import { generateAndPersistAIInsights } from '../services/ai.service';

export async function generateAIAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.body as { userId?: string; role?: string };

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure we have a fresh analysis snapshot
    const analysis = await analyzeAndPersistUser(userId);
    if (!analysis) {
      return res.status(500).json({ error: 'Failed to generate analysis for user' });
    }

    const insights = await generateAndPersistAIInsights(user, analysis, role);

    return res.json({
      aiInsights: insights
    });
  } catch (err) {
    next(err);
  }
}



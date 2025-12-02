import { Request, Response, NextFunction } from 'express';
import { syncLeetCodeForUser } from '../services/leetcode.service';

export async function syncLeetCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, username } = req.body as { userId?: string; username?: string };

    if (!userId || !username) {
      return res.status(400).json({ error: 'userId and username are required' });
    }

    const result = await syncLeetCodeForUser(userId, username);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}



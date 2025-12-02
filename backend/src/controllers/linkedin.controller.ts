import { Request, Response, NextFunction } from 'express';
import { saveLinkedInSkills } from '../services/linkedin.service';

export async function uploadLinkedInSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, payload } = req.body as { userId?: string; payload?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!userId || !payload) {
      return res.status(400).json({ error: 'userId and payload are required' });
    }

    const result = await saveLinkedInSkills(userId, payload);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}



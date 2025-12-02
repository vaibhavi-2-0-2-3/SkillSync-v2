import { Request, Response, NextFunction } from 'express';
import { getUserById, fetchUserRepos, fetchLanguageStats, fetchCommitStats } from '../services/github.service';

export async function getUserRepos(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const repos = await fetchUserRepos(user);
    return res.json({ repos });
  } catch (err) {
    next(err);
  }
}

export async function getLanguageStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const languages = await fetchLanguageStats(user);
    return res.json({ languages });
  } catch (err) {
    next(err);
  }
}

export async function getCommitStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await fetchCommitStats(user);
    return res.json({ stats });
  } catch (err) {
    next(err);
  }
}



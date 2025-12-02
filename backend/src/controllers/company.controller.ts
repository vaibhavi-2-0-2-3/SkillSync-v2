import { Request, Response, NextFunction } from 'express';
import { analyzeAndPersistUser } from '../services/analysis.service';
import { matchUserToCompanies } from '../services/company.service';

export async function getCompanyMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const analysis = await analyzeAndPersistUser(userId);
    if (!analysis) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await matchUserToCompanies(userId, analysis);

    return res.json({
      analysis,
      matches
    });
  } catch (err) {
    next(err);
  }
}



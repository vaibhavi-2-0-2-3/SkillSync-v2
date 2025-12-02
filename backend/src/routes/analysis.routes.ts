import { Router } from 'express';
import { analyzeUserProfile } from '../controllers/analysis.controller';

const router = Router();

router.get('/:userId', analyzeUserProfile);

export default router;



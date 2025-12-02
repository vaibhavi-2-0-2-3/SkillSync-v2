import { Router } from 'express';
import { generateAIAnalysis } from '../controllers/ai.controller';

const router = Router();

router.post('/generate', generateAIAnalysis);

export default router;



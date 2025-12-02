import { Router } from 'express';
import { uploadLinkedInSkills } from '../controllers/linkedin.controller';

const router = Router();

router.post('/skills', uploadLinkedInSkills);

export default router;



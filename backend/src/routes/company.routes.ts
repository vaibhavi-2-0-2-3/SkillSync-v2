import { Router } from 'express';
import { getCompanyMatches } from '../controllers/company.controller';

const router = Router();

router.get('/:userId', getCompanyMatches);

export default router;



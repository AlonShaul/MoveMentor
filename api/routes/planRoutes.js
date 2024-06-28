import express from 'express';
import { generatePlan, deletePlan, replan } from '../controllers/plan.js';

const router = express.Router();

router.get('/', generatePlan);
router.delete('/delete', deletePlan);
router.get('/replan', replan);

export default router;

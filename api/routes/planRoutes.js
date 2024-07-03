// api/routes/planRoutes.js
import express from 'express';
import { generatePlan, deletePlan, replan, getPlanById } from '../controllers/plan.js';

const router = express.Router();

router.get('/', generatePlan);
router.get('/getPlan', getPlanById); // New endpoint
router.delete('/delete', deletePlan);
router.get('/replan', replan);

export default router;

import express from 'express';
import { generatePlan, deletePlan } from '../controllers/plan.js';

const router = express.Router();

router.get('/', generatePlan);
router.delete('/delete', deletePlan);  // Ensure this line is correct

export default router;

import express from 'express';
import { generatePlan } from '../controllers/plan.js';

const router = express.Router();

router.post('/generate', generatePlan);

export default router;
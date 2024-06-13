import express from 'express';
import { generatePlan } from '../controllers/plan.js';

const router = express.Router();

router.get('/', generatePlan); // This should match your API call

export default router;

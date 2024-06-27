import express from 'express';
import { getUserDetails, getUserPlans, saveUserPlan, getUserPlansByCategory } from '../controllers/user.js';

const router = express.Router();

router.get('/:id', getUserDetails);
router.get('/:id/plans', getUserPlans);
router.get('/:id/plans-by-category', getUserPlansByCategory);
router.post('/plans', saveUserPlan);

export default router;

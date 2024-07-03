import express from 'express';
import { getUserDetails, getUserPlans, saveUserPlan, getUserPlansByCategory, getUserPlanGroups } from '../controllers/user.js';

const router = express.Router();

router.get('/:id', getUserDetails);
router.get('/:id/plans', getUserPlans);
router.get('/:id/plans-by-category', getUserPlansByCategory);
router.get('/:id/plan-groups', getUserPlanGroups);  // New route for fetching plan groups
router.post('/plans', saveUserPlan);

export default router;

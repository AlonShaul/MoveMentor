// api/routes/users.js

import express from 'express';
import { getUserDetails, getUserPlans, saveUserPlan } from '../controllers/user.js';

const router = express.Router();

router.get('/:id', getUserDetails);
router.get('/:id/plans', getUserPlans);
router.post('/plans', saveUserPlan);

export default router;

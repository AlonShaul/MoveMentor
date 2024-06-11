// api/routes/posts.js
import express from 'express';
import { getPosts, getPost, addPost, updatePost, deletePost, generateExercisePlan } from '../controllers/post.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authMiddleware, addPost);
router.put('/:id', authMiddleware, updatePost); // Ensure this route exists
router.delete('/:id', authMiddleware, adminMiddleware, deletePost);
router.get('/plan/generate', generateExercisePlan);

export default router;

// api/routes/posts.js
import express from 'express';
import { getPosts, getPost, addPost, updatePost, deletePost, generateExercisePlan, ratePost, likePost, dislikePost } from '../controllers/post.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authMiddleware, addPost);
router.put('/:id', authMiddleware, updatePost); // Use updatePost for general updates, including rating, liking, disliking
router.delete('/:id', authMiddleware, adminMiddleware, deletePost);
router.get('/plan/generate', authMiddleware, generateExercisePlan);
router.put('/:id/rate', authMiddleware, ratePost);
router.put('/:id/like', authMiddleware, likePost);
router.put('/:id/dislike', authMiddleware, dislikePost);

export default router;

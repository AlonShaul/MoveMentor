import express from 'express';
import {
  getPosts,
  getPost,
  addPost,
  updatePost,
  deletePost,
  generateExercisePlan,
  ratePost,
  likePost,
  dislikePost,
  getCategoryRatings,
  getCategoryLikesDislikes,
  getTopExercisesByDislikes,
  getUserRatingsCount,
  getPostRatingsCount,
  getAllExerciseRatings, // Import the new function
  getTopExercisesByLikes // Import the new function
} from '../controllers/post.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/ratings/count', getPostRatingsCount);
router.get('/category/ratings', getCategoryRatings);
router.get('/category/likesdislikes', getCategoryLikesDislikes);
router.get('/user/ratingscount', getUserRatingsCount);
router.get('/exercises/ratings', getAllExerciseRatings); // New route for fetching all exercise ratings
router.get('/top/likes', getTopExercisesByLikes); // New route for fetching top exercises by likes
router.get('/top/dislikes', getTopExercisesByDislikes);
router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authMiddleware, addPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, adminMiddleware, deletePost);
router.get('/plan/generate', authMiddleware, generateExercisePlan);
router.put('/:id/rate', authMiddleware, ratePost);
router.put('/:id/like', authMiddleware, likePost);
router.put('/:id/dislike', authMiddleware, dislikePost);

export default router;

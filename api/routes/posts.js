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
  getAllExerciseRatings,
  getTopExercisesByLikes,
  getAllExerciseRatingsByCategory // Import the new function
} from '../controllers/post.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/ratings/count', getPostRatingsCount);
router.get('/category/ratings', getCategoryRatings);
router.get('/category/likesdislikes', getCategoryLikesDislikes);
router.get('/user/ratingscount', getUserRatingsCount);
router.get('/exercises/ratings', getAllExerciseRatings);
router.get('/top/likes', getTopExercisesByLikes);
router.get('/top/dislikes', getTopExercisesByDislikes);
router.get('/category/exercises/ratings', getAllExerciseRatingsByCategory); // New route
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

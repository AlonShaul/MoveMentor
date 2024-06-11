// controllers/plan.js
import Plan from '../models/plan.js';
import Post from '../models/posts.js';

export const generatePlan = async (req, res) => {
  try {
    const { userId, postIds } = req.body;

    // Fetch posts from database
    const posts = await Post.find({ _id: { $in: postIds } });

    // Create a new plan
    const newPlan = new Plan({
      userId,
      posts: posts.map(post => post._id),
    });

    // Save the plan to the database
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

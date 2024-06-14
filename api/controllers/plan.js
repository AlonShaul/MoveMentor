import Post from '../models/posts.js';
import Plan from '../models/plan.js';
import User from '../models/user.js';

export const generatePlan = async (req, res) => {
  try {
    const { category, adaptedForThirdAge, adaptedForChildren, duration, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' });
    }

    const requestedDuration = parseInt(duration, 10);
    if (isNaN(requestedDuration) || requestedDuration <= 0) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    let query = { cat: category };
    if (adaptedForThirdAge !== undefined) {
      query.adaptedForThirdAge = adaptedForThirdAge === 'true';
    }
    if (adaptedForChildren !== undefined) {
      query.adaptedForChildren = adaptedForChildren === 'true';
    }

    const posts = await Post.find(query);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const exercises = posts.map(post => ({
      ...post.toObject(),
      totalDuration: (post.duration.hours * 60) + post.duration.minutes + (post.duration.seconds / 60)
    })).sort((a, b) => a.totalDuration - b.totalDuration);

    let selectedExercises = [];
    let totalDuration = 0;

    for (let exercise of exercises) {
      if (totalDuration + exercise.totalDuration <= requestedDuration) {
        selectedExercises.push(exercise);
        totalDuration += exercise.totalDuration;
      } else if (selectedExercises.length === 0 && exercise.totalDuration <= requestedDuration) {
        selectedExercises.push(exercise);
        totalDuration = exercise.totalDuration;
        break;
      } else {
        break;
      }
    }

    if (selectedExercises.length === 0) {
      return res.status(400).json({ error: 'No suitable exercises found for the requested duration' });
    }

    const plan = selectedExercises.map(exercise => ({
      title: exercise.title,
      explanation: exercise.explanation,
      videoUrl: exercise.videoUrl,
      duration: exercise.totalDuration,
      category: exercise.cat,
      adaptedForThirdAge: exercise.adaptedForThirdAge,
      adaptedForChildren: exercise.adaptedForChildren,
    }));

    const newPlan = new Plan({
      category,
      adaptedForThirdAge: adaptedForThirdAge === 'true',
      adaptedForChildren: adaptedForChildren === 'true',
      duration: totalDuration,
      exercises: plan,
      userId: user._id,
      username: user.username // Add username to the plan
    });

    await newPlan.save();

    user.currentPlan = newPlan._id;
    await user.save();

    res.status(201).json({ message: 'Plan generated successfully', plan: newPlan });
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

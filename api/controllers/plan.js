import Post from '../models/posts.js';
import Plan from '../models/plan.js';
import User from '../models/user.js';
import DeletedPlan from '../models/deletedPlan.js';

export const generatePlan = async (req, res) => {
  try {
    const { category, duration, userId, age, numberOfWeeks, sessionsPerWeek } = req.query;

    if (!userId || !category || !duration || !numberOfWeeks || !sessionsPerWeek) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requestedDuration = parseInt(duration, 10);
    if (isNaN(requestedDuration) || requestedDuration <= 0) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    let query = { cat: category };

    if (age < 14) {
      query.adaptedForChildren = true;
    } else if (age > 65) {
      query.adaptedForThirdAge = true;
    }

    const posts = await Post.find(query).sort({ rating: -1 }).lean();

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const dislikedPosts = user.dislikedPosts || [];
    const filteredPosts = posts.filter(post => !dislikedPosts.includes(post._id));

    const exercises = filteredPosts.map(post => ({
      ...post,
      totalDuration: (post.duration.hours * 60) + post.duration.minutes + (post.duration.seconds / 60)
    })).sort((a, b) => b.rating - a.rating);

    let selectedExercises = [];
    let totalDuration = 0;

    for (let exercise of exercises) {
      if (selectedExercises.length >= 5) break;
      if (totalDuration + exercise.totalDuration <= requestedDuration) {
        selectedExercises.push(exercise);
        totalDuration += exercise.totalDuration;
      } else {
        break;
      }
    }

    if (totalDuration < requestedDuration) {
      for (let exercise of exercises) {
        if (selectedExercises.length >= 5) break;
        if (!selectedExercises.includes(exercise) && (totalDuration + exercise.totalDuration) <= requestedDuration) {
          selectedExercises.push(exercise);
          totalDuration += exercise.totalDuration;
        }
        if (totalDuration >= requestedDuration) break;
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
      adaptedForThirdAge: age > 65,
      adaptedForChildren: age < 14,
      duration: totalDuration,
      numberOfWeeks: parseInt(numberOfWeeks, 10),
      sessionsPerWeek: parseInt(sessionsPerWeek, 10),
      exercises: plan,
      userId: user._id,
      username: user.username
    });

    await newPlan.save();

    user.plansByCategory.push({ category, plan: newPlan._id });
    await user.save();

    res.status(201).json({ message: 'Plan generated successfully', plan: newPlan });
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { userId, planId } = req.query;

    if (!userId || !planId) {
      return res.status(400).json({ error: 'User ID and Plan ID are required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const deletedPlan = new DeletedPlan({
      category: plan.category,
      adaptedForThirdAge: plan.adaptedForThirdAge,
      adaptedForChildren: plan.adaptedForChildren,
      duration: plan.duration,
      numberOfWeeks: plan.numberOfWeeks,
      sessionsPerWeek: plan.sessionsPerWeek,
      exercises: plan.exercises,
      userId: plan.userId,
      username: plan.username,
      status: 'deleted'
    });
    await deletedPlan.save();

    await Plan.findByIdAndDelete(planId);

    await User.updateOne(
      { _id: userId },
      { $pull: { plansByCategory: { plan: planId } } }
    );

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Replan function
export const replan = async (req, res) => {
  try {
    const { userId, planId, category, duration, adaptedForThirdAge, adaptedForChildren, numberOfWeeks, sessionsPerWeek } = req.query;

    if (!userId || !planId || !category || !duration || !numberOfWeeks || !sessionsPerWeek) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Move plan to DeletedPlan collection with status replanned
    const deletedPlan = new DeletedPlan({
      category: plan.category,
      adaptedForThirdAge: plan.adaptedForThirdAge,
      adaptedForChildren: plan.adaptedForChildren,
      duration: plan.duration,
      numberOfWeeks: plan.numberOfWeeks,
      sessionsPerWeek: plan.sessionsPerWeek,
      exercises: plan.exercises,
      userId: plan.userId,
      username: plan.username,
      status: 'replanned'
    });
    await deletedPlan.save();

    // Delete the plan from Plan collection
    await Plan.findByIdAndDelete(planId);

    // Remove plan reference from user's plansByCategory
    await User.updateOne(
      { _id: userId },
      { $pull: { plansByCategory: { plan: planId } } }
    );

    // Generate new plan
    let query = { cat: category };

    if (adaptedForChildren === 'true') {
      query.adaptedForChildren = true;
    } else if (adaptedForThirdAge === 'true') {
      query.adaptedForThirdAge = true;
    }

    const posts = await Post.find(query).sort({ rating: -1 }).lean();

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const oldExerciseIds = plan.exercises.map(exercise => exercise._id);
    const filteredPosts = posts.filter(post => !oldExerciseIds.includes(post._id));
    const shuffledPosts = filteredPosts.sort(() => 0.5 - Math.random());

    const exercises = shuffledPosts.map(post => ({
      ...post,
      totalDuration: (post.duration.hours * 60) + post.duration.minutes + (post.duration.seconds / 60)
    })).sort((a, b) => b.rating - a.rating);

    let selectedExercises = [];
    let totalDuration = 0;

    for (let exercise of exercises) {
      if (selectedExercises.length >= 5) break;
      if (totalDuration + exercise.totalDuration <= duration) {
        selectedExercises.push(exercise);
        totalDuration += exercise.totalDuration;
      } else {
        break;
      }
    }

    if (totalDuration < duration) {
      for (let exercise of exercises) {
        if (selectedExercises.length >= 5) break;
        if (!selectedExercises.includes(exercise) && (totalDuration + exercise.totalDuration) <= duration) {
          selectedExercises.push(exercise);
          totalDuration += exercise.totalDuration;
        }
        if (totalDuration >= duration) break;
      }
    }

    if (selectedExercises.length === 0) {
      return res.status(400).json({ error: 'No suitable exercises found for the requested duration' });
    }

    const newPlan = new Plan({
      category,
      adaptedForThirdAge: adaptedForThirdAge === 'true',
      adaptedForChildren: adaptedForChildren === 'true',
      duration: totalDuration,
      numberOfWeeks: parseInt(numberOfWeeks, 10),
      sessionsPerWeek: parseInt(sessionsPerWeek, 10),
      exercises: selectedExercises.map(exercise => ({
        title: exercise.title,
        explanation: exercise.explanation,
        videoUrl: exercise.videoUrl,
        duration: exercise.totalDuration,
        category: exercise.cat,
        adaptedForThirdAge: exercise.adaptedForThirdAge,
        adaptedForChildren: exercise.adaptedForChildren,
      })),
      userId: userId,
      username: plan.username
    });

    await newPlan.save();

    await User.updateOne(
      { _id: userId },
      { $push: { plansByCategory: { category, plan: newPlan._id } } }
    );

    res.status(201).json({ message: 'Plan replanned successfully', plan: newPlan });
  } catch (error) {
    console.error('Error replanning:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

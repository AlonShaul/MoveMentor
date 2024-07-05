import Post from '../models/posts.js';
import Plan from '../models/plan.js';
import User from '../models/user.js';
import DeletedPlan from '../models/deletedPlan.js';

const MIN_DURATION = 2; // Minimum duration in minutes
const MAX_DURATION = 8; // Maximum duration in minutes
const MIN_SETS = 2;
const MAX_SETS = 4;
const MIN_REPS = 8;
const MAX_REPS = 10;
const MIN_WEEKS = 1;
const MAX_WEEKS = 8;
const MIN_SESSIONS = 1;
const MAX_SESSIONS = 3;
const EXERCISES_PER_SESSION = { 1: 5, 2: 4, 3: 3 }; // Sessions per week mapped to number of exercises

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const distributeDurations = (durations, total) => {
  let currentTotal = durations.reduce((a, b) => a + b, 0);
  let adjustmentNeeded = total - currentTotal;

  while (adjustmentNeeded !== 0) {
    for (let i = 0; i < durations.length; i++) {
      if (adjustmentNeeded === 0) break;

      if (adjustmentNeeded > 0 && durations[i] < MAX_DURATION) {
        let increment = Math.min(adjustmentNeeded, MAX_DURATION - durations[i]);
        durations[i] += increment;
        adjustmentNeeded -= increment;
      } else if (adjustmentNeeded < 0 && durations[i] > MIN_DURATION) {
        let decrement = Math.min(Math.abs(adjustmentNeeded), durations[i] - MIN_DURATION);
        durations[i] -= decrement;
        adjustmentNeeded += decrement;
      }
    }
  }
};

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

    user.planGroups = user.planGroups || [];

    if (user.planGroups.length >= 5) {
      return res.status(400).json({ error: 'You have reached the limit of 5 plan groups. Please delete a plan group before creating a new one.' });
    }

    const requestedDuration = parseInt(duration, 10);
    if (isNaN(requestedDuration)) {
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    let numWeeks = parseInt(numberOfWeeks, 10);
    if (isNaN(numWeeks) || numWeeks < MIN_WEEKS || numWeeks > MAX_WEEKS) {
      return res.status(400).json({ error: `Number of weeks must be between ${MIN_WEEKS} and ${MAX_WEEKS}.` });
    }

    let sessionsPerWeekNum = parseInt(sessionsPerWeek, 10);
    if (isNaN(sessionsPerWeekNum) || sessionsPerWeekNum < MIN_SESSIONS || sessionsPerWeekNum > MAX_SESSIONS) {
      return res.status(400).json({ error: `Sessions per week must be between ${MIN_SESSIONS} and ${MAX_SESSIONS}.` });
    }

    const exercisesPerSession = EXERCISES_PER_SESSION[sessionsPerWeekNum];

    let query = { cat: category };

    if (age < 14) {
      query.adaptedForChildren = true;
    } else if (age > 65) {
      query.adaptedForThirdAge = true;
    }

    const posts = await Post.find(query).sort({ rating: -1 }).lean();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const dislikedPosts = user.dislikedPosts || [];
    const filteredPosts = posts.filter(post => !dislikedPosts.includes(post._id));

    if (!filteredPosts || filteredPosts.length === 0) {
      return res.status(404).json({ error: 'No exercises found after filtering disliked posts' });
    }

    const numVideos = filteredPosts.length;
    const maxPossibleDuration = numVideos * MAX_DURATION;
    const minPossibleDuration = numVideos * MIN_DURATION;

    if (requestedDuration > maxPossibleDuration) {
      return res.status(400).json({ error: `Requested duration exceeds the maximum possible duration of ${maxPossibleDuration} minutes with the available exercises.` });
    }

    if (requestedDuration < minPossibleDuration) {
      return res.status(400).json({ error: `Requested duration is less than the minimum possible duration of ${minPossibleDuration} minutes with the available exercises.` });
    }

    const plansByWeek = {};
    const newPlans = [];

    for (let week = 0; week < numWeeks; week++) {
      // Shuffle exercises for each week
      let shuffledExercises = shuffleArray([...filteredPosts]); // Create a shuffled copy of filteredPosts for each week
      let selectedExercises = shuffledExercises.slice(0, exercisesPerSession);
      let durations = selectedExercises.map(() => getRandomInt(MIN_DURATION, MAX_DURATION));

      distributeDurations(durations, requestedDuration);

      selectedExercises = selectedExercises.map((exercise, index) => ({
        postId: exercise._id, // Add postId here
        title: exercise.title,
        explanation: exercise.explanation,
        videoUrl: exercise.videoUrl,
        duration: durations[index],
        category: exercise.cat,
        sets: getRandomInt(MIN_SETS, MAX_SETS),
        turns: getRandomInt(MIN_REPS, MAX_REPS),
        adaptedForThirdAge: exercise.adaptedForThirdAge,
        adaptedForChildren: exercise.adaptedForChildren,
      }));

      const newPlan = new Plan({
        category,
        adaptedForThirdAge: age > 65,
        adaptedForChildren: age < 14,
        duration: requestedDuration,
        numberOfWeeks: numWeeks,
        sessionsPerWeek: sessionsPerWeekNum,
        exercises: selectedExercises,
        userId: user._id,
        username: user.username
      });

      await newPlan.save();
      plansByWeek[`week_${week + 1}`] = newPlan;
      newPlans.push(newPlan._id);
    }

    const planGroupName = `Plan Group ${user.planGroups.length + 1}`;
    user.planGroups.push({ groupName: planGroupName, category, plans: newPlans });

    await user.save();

    res.status(201).json({ message: 'Plans generated successfully', plansByWeek, planGroupName });
  } catch (error) {
    console.error('Error generating plans:', error);
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

    await Plan.findByIdAndDelete(planId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.planGroups = user.planGroups || [];
    user.planGroups.forEach(group => {
      group.plans = group.plans.filter(id => !id.equals(planId));
    });

    // Remove empty plan groups
    user.planGroups = user.planGroups.filter(group => group.plans && group.plans.length > 0);

    await user.save();

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const replan = async (req, res) => {
  try {
    const { userId, planId, category, duration, age, numberOfWeeks, sessionsPerWeek } = req.query;

    if (!userId || !planId || !category || !duration || !numberOfWeeks || !sessionsPerWeek) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.planGroups = user.planGroups || [];

    // Find the plan group containing the specified planId
    const groupIndex = user.planGroups.findIndex(group => group.plans.some(id => id.equals(planId)));
    if (groupIndex === -1) {
      return res.status(404).json({ error: 'Plan group not found' });
    }

    const planGroup = user.planGroups[groupIndex];
    const originalGroupName = planGroup.groupName;

    // Directly delete all plans in the group
    await Plan.deleteMany({ _id: { $in: planGroup.plans } });

    // Remove the empty plan group from user's planGroups
    user.planGroups.splice(groupIndex, 1);

    await user.save();

    // Now, generate a new plan
    const requestedDuration = parseInt(duration, 10);
    if (isNaN(requestedDuration)) {
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    let numWeeks = parseInt(numberOfWeeks, 10);
    if (isNaN(numWeeks) || numWeeks < MIN_WEEKS || numWeeks > MAX_WEEKS) {
      return res.status(400).json({ error: `Number of weeks must be between ${MIN_WEEKS} and ${MAX_WEEKS}.` });
    }

    let sessionsPerWeekNum = parseInt(sessionsPerWeek, 10);
    if (isNaN(sessionsPerWeekNum) || sessionsPerWeekNum < MIN_SESSIONS || sessionsPerWeekNum > MAX_SESSIONS) {
      return res.status(400).json({ error: `Sessions per week must be between ${MIN_SESSIONS} and ${MAX_SESSIONS}.` });
    }

    const exercisesPerSession = EXERCISES_PER_SESSION[sessionsPerWeekNum];

    let query = { cat: category };

    if (age < 14) {
      query.adaptedForChildren = true;
    } else if (age > 65) {
      query.adaptedForThirdAge = true;
    }

    const posts = await Post.find(query).sort({ rating: -1 }).lean();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const dislikedPosts = user.dislikedPosts || [];
    const filteredPosts = posts.filter(post => !dislikedPosts.includes(post._id));

    if (!filteredPosts || filteredPosts.length === 0) {
      return res.status(404).json({ error: 'No exercises found after filtering disliked posts' });
    }

    const numVideos = filteredPosts.length;
    const maxPossibleDuration = numVideos * MAX_DURATION;
    const minPossibleDuration = numVideos * MIN_DURATION;

    if (requestedDuration > maxPossibleDuration) {
      return res.status(400).json({ error: `Requested duration exceeds the maximum possible duration of ${maxPossibleDuration} minutes with the available exercises.` });
    }

    if (requestedDuration < minPossibleDuration) {
      return res.status(400).json({ error: `Requested duration is less than the minimum possible duration of ${minPossibleDuration} minutes with the available exercises.` });
    }

    const newPlans = [];
    const plansByWeek = {};

    for (let week = 0; week < numWeeks; week++) {
      // Shuffle exercises for each week
      let shuffledExercises = shuffleArray([...filteredPosts]); // Create a shuffled copy of filteredPosts for each week
      let selectedExercises = shuffledExercises.slice(0, exercisesPerSession);
      let durations = selectedExercises.map(() => getRandomInt(MIN_DURATION, MAX_DURATION));

      distributeDurations(durations, requestedDuration);

      selectedExercises = selectedExercises.map((exercise, index) => ({
        postId: exercise._id, // Add postId here
        title: exercise.title,
        explanation: exercise.explanation,
        videoUrl: exercise.videoUrl,
        duration: durations[index],
        category: exercise.cat,
        sets: getRandomInt(MIN_SETS, MAX_SETS),
        turns: getRandomInt(MIN_REPS, MAX_REPS),
        adaptedForThirdAge: exercise.adaptedForThirdAge,
        adaptedForChildren: exercise.adaptedForChildren,
      }));

      const newPlan = new Plan({
        category,
        adaptedForThirdAge: age > 65,
        adaptedForChildren: age < 14,
        duration: requestedDuration,
        numberOfWeeks: numWeeks,
        sessionsPerWeek: sessionsPerWeekNum,
        exercises: selectedExercises,
        userId: user._id,
        username: user.username
      });

      await newPlan.save();
      plansByWeek[`week_${week + 1}`] = newPlan;
      newPlans.push(newPlan);
    }

    user.planGroups.push({ groupName: originalGroupName, category, plans: newPlans.map(plan => plan._id) });

    await user.save();

    res.status(201).json({ message: 'Plans replanned successfully', plansByWeek });
  } catch (error) {
    console.error('Error replanning:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const getPlanById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

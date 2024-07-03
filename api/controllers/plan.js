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

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No exercises found for your criteria' });
    }

    const dislikedPosts = user.dislikedPosts || [];
    const filteredPosts = posts.filter(post => !dislikedPosts.includes(post._id));

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
      let selectedExercises = filteredPosts.slice(0, exercisesPerSession);
      let durations = selectedExercises.map(() => getRandomInt(MIN_DURATION, MAX_DURATION));

      distributeDurations(durations, requestedDuration);

      selectedExercises = selectedExercises.map((exercise, index) => ({
        ...exercise,
        sets: getRandomInt(MIN_SETS, MAX_SETS),
        turns: getRandomInt(MIN_REPS, MAX_REPS),
        duration: durations[index],
        category: exercise.cat
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

    const user = await User.findById(userId);
    user.planGroups.forEach(group => {
      group.plans = group.plans.filter(id => !id.equals(planId));
    });

    // Remove empty plan groups
    user.planGroups = user.planGroups.filter(group => group.plans.length > 0);

    await user.save();

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const replan = async (req, res) => {
  try {
    const { userId, planId, category, adaptedForThirdAge, adaptedForChildren, numberOfWeeks, sessionsPerWeek, duration } = req.query;

    if (!userId || !planId || !category || !duration || !numberOfWeeks || !sessionsPerWeek) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requestedDuration = parseInt(duration, 10);
    if (isNaN(requestedDuration)) {
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    const weeks = Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, parseInt(numberOfWeeks, 10)));
    const sessions = Math.max(MIN_SESSIONS, Math.min(MAX_SESSIONS, parseInt(sessionsPerWeek, 10)));

    const oldPlan = await Plan.findById(planId);
    if (!oldPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Move old plan to DeletedPlan collection with status replanned
    const deletedPlan = new DeletedPlan({
      category: oldPlan.category,
      adaptedForThirdAge: oldPlan.adaptedForThirdAge,
      adaptedForChildren: oldPlan.adaptedForChildren,
      duration: oldPlan.duration,
      numberOfWeeks: oldPlan.numberOfWeeks,
      sessionsPerWeek: oldPlan.sessionsPerWeek,
      exercises: oldPlan.exercises,
      userId: oldPlan.userId,
      username: oldPlan.username,
      status: 'replanned'
    });
    await deletedPlan.save();

    // Delete the old plan from Plan collection
    await Plan.findByIdAndDelete(planId);

    // Remove old plan reference from user's planGroups
    user.planGroups.forEach(group => {
      group.plans = group.plans.filter(id => !id.equals(planId));
    });

    // Remove empty plan groups
    user.planGroups = user.planGroups.filter(group => group.plans.length > 0);

    await user.save();

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

    const dislikedPosts = user.dislikedPosts || [];
    const filteredPosts = posts.filter(post => !dislikedPosts.includes(post._id));

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

    for (let week = 0; week < weeks; week++) {
      for (let session = 0; session < sessions; session++) {
        const exercisesPerSession = 6 - sessions; // 5 for 1 session, 4 for 2 sessions, 3 for 3 sessions per week

        if (filteredPosts.length < exercisesPerSession) {
          return res.status(400).json({ error: `Not enough exercises available for the requested sessions per week.` });
        }

        let selectedExercises = filteredPosts.slice(0, exercisesPerSession);
        let durations = selectedExercises.map(() => getRandomInt(MIN_DURATION, MAX_DURATION));

        distributeDurations(durations, requestedDuration);

        selectedExercises = selectedExercises.map((exercise, index) => ({
          ...exercise,
          sets: getRandomInt(MIN_SETS, MAX_SETS),
          turns: getRandomInt(MIN_REPS, MAX_REPS),
          duration: durations[index],
          category: exercise.cat
        }));

        const newPlan = new Plan({
          category,
          adaptedForThirdAge: adaptedForThirdAge === 'true',
          adaptedForChildren: adaptedForChildren === 'true',
          duration: requestedDuration,
          numberOfWeeks: weeks,
          sessionsPerWeek: sessions,
          exercises: selectedExercises,
          userId: user._id,
          username: user.username
        });

        await newPlan.save();
        newPlans.push(newPlan._id);
        plansByWeek[`week_${week + 1}`] = newPlan;
      }
    }

    const newPlanGroupName = `Plan Group ${user.planGroups.length + 1}`;
    user.planGroups.push({ groupName: newPlanGroupName, category, plans: newPlans });

    await user.save();

    res.status(201).json({ message: 'Plan replanned successfully', plans: newPlans, newPlanGroupName });
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

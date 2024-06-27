import User from '../models/user.js';
import Plan from '../models/plan.js';

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserPlans = async (req, res) => {
  try {
    const userId = req.params.id;
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 }).limit(1);
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserPlansByCategory = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('plansByCategory.plan');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.plansByCategory);
  } catch (error) {
    console.error('Error fetching user plans by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const saveUserPlan = async (req, res) => {
  try {
    const { userId, planId, category } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plansByCategory.push({ category, plan: planId });
    await user.save();

    res.status(201).json({ message: 'Plan saved to user profile successfully' });
  } catch (err) {
    console.error('Error saving user plan:', err);
    res.status(500).json({ message: err.message });
  }
};

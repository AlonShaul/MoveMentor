// api/controllers/users.js

import User from '../models/user.js';
import Plan from '../models/plan.js'; // Assuming you have a plan model

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
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 }).limit(1); // Fetch the most recent plan
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const saveUserPlan = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const newPlan = new Plan({ userId, postId });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

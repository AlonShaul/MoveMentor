// api/controllers/users.js

import User from '../models/user.js';
import Plan from '../models/plan.js'; // Assuming you have a plan model

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
    const plans = await Plan.find({ userId: req.params.id }).populate('postId');
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

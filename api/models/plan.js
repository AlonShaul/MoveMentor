// models/Plan.js
import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Plan', PlanSchema);

// api/models/ExercisePlan.js
import mongoose from 'mongoose';

const ExercisePlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercises: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    title: { type: String, required: true },
    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
      seconds: { type: Number, default: 0 }
    },
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExercisePlan || mongoose.model('ExercisePlan', ExercisePlanSchema);

import mongoose from 'mongoose';

const DeletedPlanSchema = new mongoose.Schema({
  category: { type: String, required: true },
  adaptedForThirdAge: { type: Boolean, required: true },
  adaptedForChildren: { type: Boolean, required: true },
  duration: { type: Number, required: true },
  exercises: [
    {
      title: { type: String, required: true },
      explanation: { type: String, required: true },
      videoUrl: { type: String, required: true },
      duration: { type: Number, required: true },
      category: { type: String, required: true },
      adaptedForThirdAge: { type: Boolean, required: true },
      adaptedForChildren: { type: Boolean, required: true }
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeletedPlan', DeletedPlanSchema);

import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  category: { type: String, required: true },
  adaptedForThirdAge: { type: Boolean, required: true },
  adaptedForChildren: { type: Boolean, required: true },
  duration: { type: Number, required: true },
  numberOfWeeks: { type: Number, required: true },
  sessionsPerWeek: { type: Number, required: true },
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
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Plan', PlanSchema);

import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Add postId here
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  adaptedForThirdAge: { type: Boolean, required: true },
  adaptedForChildren: { type: Boolean, required: true },
  sets: { type: Number, required: true },
  turns: { type: Number, required: true }
});

const PlanSchema = new mongoose.Schema({
  category: { type: String, required: true },
  adaptedForThirdAge: { type: Boolean, required: true },
  adaptedForChildren: { type: Boolean, required: true },
  duration: { type: Number, required: true },
  numberOfWeeks: { type: Number, required: true },
  sessionsPerWeek: { type: Number, required: true },
  exercises: [ExerciseSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Plan', PlanSchema);

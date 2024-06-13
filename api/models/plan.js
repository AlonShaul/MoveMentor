import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number, required: true }, // Store total duration in minutes or seconds
  category: { type: String, required: true },
  adaptedForThirdAge: { type: Boolean, default: false },
  adaptedForChildren: { type: Boolean, default: false },
});

const PlanSchema = new mongoose.Schema({
  category: { type: String, required: true },
  adaptedForThirdAge: { type: Boolean, default: false },
  adaptedForChildren: { type: Boolean, default: false },
  duration: { type: Number, required: true }, // Store total duration of the plan
  exercises: [ExerciseSchema],
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Plan', PlanSchema);

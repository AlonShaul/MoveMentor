import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true }
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 }
  },
  adaptedForThirdAge: { type: Boolean, default: false },
  adaptedForChildren: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  cat: { type: String, required: true },
  date: { type: Date, default: Date.now },
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [RatingSchema]
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);

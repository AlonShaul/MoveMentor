import mongoose from 'mongoose';

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
  cat: { type: String, required: true },
  date: { type: Date, default: Date.now },
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);

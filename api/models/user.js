import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // Reference to the current plan
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './user.js'; // Adjust the path based on your project structure
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Log the environment variable to ensure it's loaded
console.log('MONGO_URL:', process.env.MONGO_URL);

// Use the MongoDB connection string from environment variables
const mongoURI = 'mongodb://localhost:27017/blog';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const createAdminUser = async () => {
  try {
    const email = 'admin@MoveMentor.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const newAdmin = new User({
      username: 'admin',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createAdminUser();

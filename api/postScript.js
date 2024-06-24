import mongoose from 'mongoose';
import Post from './models/posts.js'; // Adjust the path as necessary
import dotenv from 'dotenv';

dotenv.config(); // Ensure you have a .env file with your MongoDB connection string

const updatePosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const posts = await Post.find({});

    for (let post of posts) {
      if (post.sessionsPerWeek === undefined) post.sessionsPerWeek = 0;
      if (post.numberOfWeeks === undefined) post.numberOfWeeks = 0;
      if (post.likes === undefined) post.likes = [];
      if (post.dislikes === undefined) post.dislikes = [];
      if (post.ratings === undefined) post.ratings = [];
      
      // Provide default values for required fields if they are missing
      if (!post.username) post.username = 'defaultUsername';
      if (!post.userImg) post.userImg = 'defaultImageUrl';
      
      await post.save();
    }

    console.log('All posts updated successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating posts:', error);
    mongoose.connection.close();
  }
};

updatePosts();

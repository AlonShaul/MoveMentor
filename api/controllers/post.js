import Post from '../models/posts.js';
import User from '../models/user.js'; // Ensure User model is imported

// api/controllers/post.js
export const getCategoryRatings = async (req, res) => {
  try {
    const posts = await Post.find();
    const categoryRatings = {};

    posts.forEach(post => {
      if (post.ratings.length > 0) {
        const validRatings = post.ratings.filter(r => r.value !== 0);
        if (validRatings.length > 0) {
          const sumRatings = validRatings.reduce((sum, r) => sum + r.value, 0);
          if (categoryRatings[post.cat]) {
            categoryRatings[post.cat].sum += sumRatings;
            categoryRatings[post.cat].count += validRatings.length;
          } else {
            categoryRatings[post.cat] = { sum: sumRatings, count: validRatings.length };
          }
        }
      }
    });


    const categoryAverages = Object.keys(categoryRatings).reduce((acc, cat) => {
      acc[cat] = categoryRatings[cat].sum / categoryRatings[cat].count;
      return acc;
    }, {});


    res.status(200).json(categoryAverages);
  } catch (err) {
    console.error("Error calculating category ratings:", err);
    res.status(500).json({ message: err.message });
  }
};


// Add this new function to fetch top 5 exercises by likes
export const getCategoryLikesDislikes = async (req, res) => {
  try {
    const posts = await Post.find();

    const categoryLikesDislikes = {};

    posts.forEach(post => {
      const likeCount = post.likes.length;
      const dislikeCount = post.dislikes.length;

      if (likeCount > 0 || dislikeCount > 0) {
        if (categoryLikesDislikes[post.cat]) {
          categoryLikesDislikes[post.cat].likes += likeCount;
          categoryLikesDislikes[post.cat].dislikes += dislikeCount;
        } else {
          categoryLikesDislikes[post.cat] = {
            likes: likeCount,
            dislikes: dislikeCount,
          };
        }
      }
    });
    res.status(200).json(categoryLikesDislikes);
  } catch (err) {
    console.error("Error calculating category likes and dislikes:", err);
    res.status(500).json({ message: err.message });
  }
};


// Add this new function to fetch top 5 exercises by dislikes
export const getTopExercisesByDislikes = async (req, res) => {
  try {
    const posts = await Post.find();
    const topDislikedExercises = posts
      .map(post => ({
        title: post.title,
        dislikes: post.dislikes.length
      }))
      .sort((a, b) => b.dislikes - a.dislikes)
      .slice(0, 5);

    console.log("Top Exercises by Dislikes:", topDislikedExercises);
    res.status(200).json(topDislikedExercises);
  } catch (err) {
    console.error("Error fetching top exercises by dislikes:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getUserRatingsCount = async (req, res) => {
  try {
    console.log("getUserRatingsCount called");
    const posts = await Post.find();

    const userRatingsCount = {};

    posts.forEach(post => {
      post.ratings.forEach(rating => {
        if (userRatingsCount[rating.userId]) {
          userRatingsCount[rating.userId] += 1;
        } else {
          userRatingsCount[rating.userId] = 1;
        }
      });
    });

    const userIds = Object.keys(userRatingsCount);
    const users = await User.find({ _id: { $in: userIds } }).select('username');

    const userRatings = users.map(user => ({
      username: user.username,
      count: userRatingsCount[user._id.toString()] // Convert ObjectId to string for consistency
    }));

    res.status(200).json(userRatings);
  } catch (err) {
    console.error("Error calculating user ratings count:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPostRatingsCount = async (req, res) => {
  try {
    const posts = await Post.find();
    const postRatingsCount = posts
      .filter(post => post.ratings.length > 0) // Filter out posts with zero ratings
      .map(post => ({
        title: post.title,
        ratingCount: post.ratings.length
      }));

    // Sort by ratingCount to find the most rated posts
    postRatingsCount.sort((a, b) => b.ratingCount - a.ratingCount);

    res.status(200).json(postRatingsCount);
  } catch (err) {
    console.error("Error calculating post ratings count:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getAllExerciseRatings = async (req, res) => {
  try {
    const posts = await Post.find();
    const exerciseRatings = posts
      .filter(post => post.ratings.length > 0)
      .map(post => ({
        title: post.title,
        category: post.cat,
        averageRating: post.ratings.length ? (post.ratings.reduce((sum, r) => sum + r.value, 0) / post.ratings.length).toFixed(2) : 0
      }));

    console.log("Exercise Ratings:", exerciseRatings);
    res.status(200).json(exerciseRatings);
  } catch (err) {
    console.error("Error fetching exercise ratings:", err);
    res.status(500).json({ message: err.message });
  }
};



export const getTopExercisesByLikes = async (req, res) => {
  try {
    const posts = await Post.find();
    const topExercises = posts
      .map(post => ({
        title: post.title,
        likes: post.likes.length
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    console.log("Top Exercises by Likes:", topExercises);
    res.status(200).json(topExercises);
  } catch (err) {
    console.error("Error fetching top exercises by likes:", err);
    res.status(500).json({ message: err.message });
  }
};






export const getAllExerciseRatingsByCategory = async (req, res) => {
  try {
    const posts = await Post.find();
    const categoryExerciseRatings = {};

    posts.forEach(post => {
      if (!categoryExerciseRatings[post.cat]) {
        categoryExerciseRatings[post.cat] = [];
      }
      const validRatings = post.ratings.filter(r => r.value !== 0);
      if (validRatings.length > 0) {
        const sumRatings = validRatings.reduce((sum, r) => sum + r.value, 0);
        const avgRating = sumRatings / validRatings.length;
        categoryExerciseRatings[post.cat].push({
          title: post.title,
          averageRating: avgRating.toFixed(2),
          ratingCount: validRatings.length
        });
      }
    });

    const response = Object.keys(categoryExerciseRatings).map(category => ({
      categoryName: category,
      exercises: categoryExerciseRatings[category]
    }));

    console.log("Category Exercise Ratings:", response);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching category exercise ratings:", err);
    res.status(500).json({ message: err.message });
  }
};







export const generateExercisePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({}).limit(5); // Get some posts (customize as needed)

    const exercises = posts.map(post => ({
      postId: post._id,
      title: post.title,
      duration: post.duration,
    }));

    const newPlan = new ExercisePlan({
      userId,
      exercises,
    });

    const savedPlan = await newPlan.save();

    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const ratePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { rating } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    const existingRating = post.ratings.find(r => r.userId.toString() === userId.toString());
    if (existingRating) {
      existingRating.value = rating;
    } else {
      post.ratings.push({ userId, value: rating });
    }

    const totalRating = post.ratings.reduce((sum, r) => sum + r.value, 0);
    post.rating = totalRating / post.ratings.length;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    if (!post.likes.includes(userId)) post.likes.push(userId);
    post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    if (!post.dislikes.includes(userId)) post.dislikes.push(userId);
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getPosts = async (req, res) => {
  try {
    const category = req.query.category;
    let posts;
    
    if (category) {
      posts = await Post.find({ cat: category });
    } else {
      posts = await Post.find();
    }
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addPost = async (req, res) => {
  const { title, explanation, videoUrl, duration, adaptedForThirdAge, adaptedForChildren, cat, uid } = req.body;
  const totalSeconds = (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;
  const newPost = new Post({
    title,
    explanation,
    videoUrl,
    duration: { ...duration, totalSeconds },
    adaptedForThirdAge,
    adaptedForChildren,
    cat,
    uid
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ message: err.message });
  }
};


export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, explanation, videoUrl, duration, adaptedForThirdAge, adaptedForChildren, cat } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    // Update post fields
    if (title !== undefined) post.title = title;
    if (explanation !== undefined) post.explanation = explanation;
    if (videoUrl !== undefined) post.videoUrl = videoUrl;
    if (duration !== undefined) post.duration = duration;
    if (adaptedForThirdAge !== undefined) post.adaptedForThirdAge = adaptedForThirdAge;
    if (adaptedForChildren !== undefined) post.adaptedForChildren = adaptedForChildren;
    if (cat !== undefined) post.cat = cat;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findOneAndDelete({ _id: req.params.id, uid: req.user.id });
    if (!deletedPost) return res.status(404).json("Post not found or you are not authorized to delete this post");
    res.status(200).json("Post deleted successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

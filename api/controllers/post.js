import Post from '../models/posts.js';

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

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

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
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
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
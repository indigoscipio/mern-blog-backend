const User = require("../models/User");
const Post = require("../models/Post");

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author");

    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
  }
};

const getSinglePost = async (req, res) => {
  try {
    const { id: postId } = req.params;

    if (!postId) {
      res.status(400).json({ message: "Invalid Post Id!" });
    }

    const post = await Post.findOne({ _id: postId }).populate("author");

    if (!post) {
      res.status(400).json({ message: "Post not found!!" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
  }
};

const createPost = async (req, res) => {
  try {
    const { _id: postId, author, title, content } = req.body;

    const postAuthor = await User.findById(author);

    if (!title || !content || !author) {
      return res
        .status(400)
        .json({ error: "title, content & author required" });
    }

    if (!postAuthor) {
      res.status(400).json({ message: "Author can't be found!" });
    }

    const newPost = new Post({
      content,
      title,
      author,
    });

    const createdPost = await newPost.save();
    // Update user's posts array with the new post's ID
    postAuthor.posts.push(createdPost._id);
    await postAuthor.save();

    res.status(200).json(createdPost);
  } catch (err) {
    console.log(err);
  }
};

const updatePost = async (req, res) => {
  try {
    const { _id: postId, title, content, author } = req.body;
    const postAuthor = await User.findById(author);
    console.log(postAuthor);

    if (!postId || !title || !content) {
      return res
        .status(400)
        .json({ error: "Invalid post ID, content or title!" });
    }

    if (!author) {
      return res.status(400).json({ error: "author required" });
    }

    //validate author
    const isAuthor = await Post.exists({ _id: postId, author });

    if (!isAuthor) {
      return res.status(403).json({
        error: "Permission denied. You are not the author of this post",
      });
    }

    const updatedPostObj = {
      title,
      content,
    };
    const updatedPost = await Post.findByIdAndUpdate(postId, updatedPostObj, {
      new: true,
    });

    // Update the post in the user's array of posts
    const user = await User.findOneAndUpdate(
      { _id: author, "posts._id": postId },
      { $set: { "posts.$": updatedPost } },
      { new: true }
    );

    res.status(200).json({ message: "Post updated", updatedPost });
  } catch (err) {
    console.log(err);
  }
};

const deletePost = async (req, res) => {
  try {
    const { _id: postId, author } = req.body;

    const postExists = await Post.findOne({ _id: postId });

    if (!postId || !author) {
      return res.status(400).json({ error: "Invalid post ID or author" });
    }

    if (!postExists) {
      return res.status(400).json({ error: "post does not exist" });
    }

    const postAuthor = await User.findById(author);
    if (!postAuthor) {
      return res.status(400).json({ error: "Invalid author ID" });
    }

    const isAuthor = await Post.exists({ _id: postId, author });
    if (!isAuthor) {
      return res.status(403).json({
        error: "Permission denied. You are not the author of this post",
      });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    await User.findByIdAndUpdate(
      author,
      { $pull: { posts: postId } }, // Use $pull to remove the postId from the array
      { new: true }
    );

    res.status(200).json({ message: "Post deleted", deletedPost });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createPost,
  getSinglePost,
  getAllPosts,
  updatePost,
  deletePost,
};

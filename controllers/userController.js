const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("posts");

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
  }
};

const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).send({ message: "inputs required" });
  }

  // Check if the email is already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email is already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(201).json(newUser);

  try {
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, password, email, _id: userId } = req.body;

    const currentUser = await User.findById(userId);

    // Validate if the userId is a valid ObjectId
    if (!userId || !currentUser) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Update user information
    if (username) currentUser.username = username;
    if (email) currentUser.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      currentUser.password = hashedPassword;
    }

    await currentUser.save();

    res
      .status(200)
      .json({ message: `username with id ${userId} updated`, currentUser });
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { _id: userId } = req.body;
    const userIdFromMiddleware = req.user._id;
    console.log(userId, userIdFromMiddleware);

    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Convert userId from request body to ObjectId
    const requestedUserId = new ObjectId(userId);

    // Check if the user making the request is the owner of the account
    if (!userIdFromMiddleware.equals(requestedUserId)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this user" });
    }

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all posts associated with the user
    await Post.deleteMany({ _id: { $in: deletedUser.posts } });

    res
      .status(200)
      .json({ message: `user with id ${userId} successfully deleted` });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getAllUsers, updateUser, createUser, deleteUser };

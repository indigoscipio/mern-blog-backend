const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate fields
    if (!password || !email) {
      return res.status(400).json({ message: "all fields are requried" });
    }

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    //use bcrypt to compare
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    //create access, refresh
    const accessToken = jwt.sign(
      {
        username: user.username,
        _id: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        username: user.username,
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET
    );

    //create cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    //send access token containing user info
    res.json({ accessToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    console.log("REFRESH TOKEN: ", refreshToken);

    //if we dont have a cookie, send a 401 unauthorized
    if (!refreshToken) {
      return res.status(401).json({ message: "NO refresh token found!" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the user exists (you can customize this part based on your user model)
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create a new access token
    const newAccessToken = jwt.sign(
      {
        username: user.username,
        _id: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    //check for cookies
    if (!req.cookies.jwt) {
      return res.status(204).json({ message: "No cookies found" });
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logout successful. Cookie cleared." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { refresh, login, logout };

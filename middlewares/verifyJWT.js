const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyJWT = async (req, res, next) => {
  try {
    //define auth header
    const authHeader = req.headers.authorization || req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Extract the token from the request headers
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if the user exists
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Attach the user to the request for further use in controllers
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = verifyJWT;

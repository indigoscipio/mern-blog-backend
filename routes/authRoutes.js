const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const loginLimiter = require("../middlewares/loginLimiter");

router.post("/login", loginLimiter, authController.login);
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;

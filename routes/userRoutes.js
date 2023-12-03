const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/", userController.createUser);
router.use(verifyJWT);

router.get("/", userController.getAllUsers);
router.patch("/", userController.updateUser);
router.delete("/", userController.deleteUser);

module.exports = router;

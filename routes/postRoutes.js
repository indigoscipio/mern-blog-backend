const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");

router.use(verifyJWT);

router.get("/", postController.getAllPosts);
router.get("/:id", postController.getSinglePost);
router.patch("/", postController.updatePost);
router.post("/", postController.createPost);
router.delete("/", postController.deletePost);

module.exports = router;

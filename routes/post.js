const express = require("express");
const router = express.Router();
const postController = require("../controller/post");
const isAuth = require("../middleware/isAuth");
const { body } = require("express-validator/check");

// GET all posts
router.get("/posts", postController.getPosts);

// GET post detail
router.get("/posts/:postId", postController.getPostDetail);

// GET user posts
router.get("/my-posts", isAuth,postController.getAuthorPost);

// GET add post page
router.get("/add-post", isAuth, postController.getAddPost);

// POST add post
router.post(
  "/add-post",
  isAuth,
  [
    body("title", "Enter valid title")
      .trim()
      .escape()
      .not().isEmpty(),
    body("description", "Enter valid description")
      .trim()
      .escape()
      .not().isEmpty()
  ],
  postController.postAddPost
);

// POST edit post
router.get("/posts/:postId/edit", isAuth, postController.getEditPost);
router.post(
  "/post-edit",
  isAuth,
  [
    body("title", "Enter valid title")
      .trim()
      .escape()
      .not().isEmpty(),
    body("description", "Enter valid description")
      .trim()
      .escape()
      .not().isEmpty()
  ],
  postController.postEditPost
);

// POST delete post
router.delete("/posts/:postId/", isAuth, postController.deletePost);

module.exports = router;

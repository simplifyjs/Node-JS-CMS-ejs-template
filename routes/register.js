const express = require("express");
const router = express.Router();
const registerCtrl = require("../controller/register");
const isAuth = require("../middleware/isAuth");
const { body } = require("express-validator/check");
const User = require("../models/user");

// GET for front page
router.get("/", registerCtrl.getFrontPage);

// GET route for reading data
router.get("/register", registerCtrl.getRegister);

//POST route for signup/registration
router.post(
  "/register",
  [
    body("email", "Invalid Email")
      .isEmail()
      .not().isEmpty().withMessage("Required")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject("Email exists already. Pick another one");
          }
        });
      }),
    body("username")
      .not().isEmpty().withMessage("Required")
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then(user => {
          if (user) {
            return Promise.reject("Username exists already. Pick another one");
          }
        });
      }),
    body("password","Password should contain more than 8 characters")
      .trim()
      .isLength({ min: 8 })
      .not().isEmpty().withMessage("Required")
      .escape(),
    body("passwordConf", "Password confirmation does not match with the password")
      .trim()
      .not().isEmpty().withMessage("Required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }
        return true;
      })
      .escape()
  ],
  registerCtrl.postRegister
);

// GET for login
router.get("/login", registerCtrl.getLogin);

// POST for login
router.post(
  "/login",
  [
    body("logemail", "Invalid Email")
      .isEmail()
      .custom((value, {req}) => {
        return User.findOne({email: value}).then(user => {
          if(!user) return false;
          return true;
        })
      }).withMessage("Email does not exist")
      .not().isEmpty().withMessage("Required"),
    body("logpassword")
      .not().isEmpty().withMessage("Required")
  ],
  registerCtrl.postLogin
);

// GET for logout
router.get("/logout", isAuth, registerCtrl.getLogout);

module.exports = router;

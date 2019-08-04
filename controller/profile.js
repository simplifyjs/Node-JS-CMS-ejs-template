const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const ITEMS_PER_PAGE = 2;
let totalItems;

// GET route after registering - Account page
exports.getAccount = async(req, res, next) => {
  if (!req.session.userId) {
    const error = new Error("Access denied");
    error.httpStatusCode = 402;
    next(error);
  }
  try{
    const user = await User.findById(req.session.userId)
    if(!user) return;
    return res.render("user/account", {
      pageTitle: user.username,
      profile: user,
      errFields: {
        errEmail: '',
        errUsername: '',
        errPassword: '',
        errPasswordConf: ''
      }
    });
  } catch(err) {
    return next(err);
  }
};

// GET All User Profile
exports.getAllUsers = async(req, res, next) => {
  let page = +req.query.page || 1;
  let message = req.flash("notification");

  try{
    const userCount = await User.find({}).countDocuments();
    totalItems = userCount;
  
    const users = await User.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  
    if(!users) return next(new Error("User does not exist"));
    let userMap = [];
    users.forEach(user => {
      if (user) {
        userMap.push(user);
      }
    });
  
    return res.render("user/user-list", {
      pageTitle: "User List",
      users: userMap,
      errMessage: message.length > 0 ? message[0] : null,
      itemsPerPage: ITEMS_PER_PAGE,
      totalItems: totalItems,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  } catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  }
};

// GET Specific User Profile
exports.getUser = async(req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    return res.render("user/user", { pageTitle: user.username, profile: user });
    
  } catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  }
};

// GET route PROFILE EDIT PAGE
exports.getUserEdit = async(req, res, next) => {
  var message = req.flash("error");

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  
    let accountPath;
    if(req.session.userId == req.params.userId){
      accountPath = "user/account";
    } else {
      accountPath = "user/user-edit";
    }
  
    return res.render(accountPath, {
      pageTitle: user.username,
      profile: user,
      errMessage: message.length > 0 ? message[0] : null,
      errFields: {
        errEmail: '',
        errUsername: '',
        errPassword: '',
        errPasswordConf: ''
      }
    });
  } catch(err){
    console.log(err);
  }
};

// POST route PROFILE EDIT PAGE (OWN profile)
exports.postUserEdit = async(req, res, next) => {
  if (!req.session.userId) return next(error);

  let newEmail = req.body.email,
    newUserName = req.body.username,
    newPassword = req.body.newpassword,
    newPasswordConf = req.body.newpasswordConf;

  let preUser = {
    email: newEmail,
    username: newUserName,
    newpassword: newPassword,
    id: req.params.userId || ''
  };

  const valError = validationResult(req);
  const errArray = valError.array();

  if (!valError.isEmpty()) {
    let eEmail, eUsername, ePass, ePassConf;
    errArray.forEach(i => {
      switch(i.param) {
        case 'email':
          eEmail = i.msg;
          break;
        case 'username':
          eUsername = i.msg;
          break;
        case 'newpassword':
          ePass = i.msg;
          break;
        case 'newpasswordConf':
          ePassConf = i.msg;
          break;
      }
    })

    let accountPath;
    if(req.session.userId == req.params.userId){
      accountPath = "user/account";
    } else {
      accountPath = "user/user-edit";
    }

    return res.render(accountPath, {
      pageTitle: newUserName,
      profile: preUser,
      errFields: {
        errEmail: eEmail,
        errUsername: eUsername,
        errPassword: ePass,
        errPasswordConf: ePassConf
      }
    });
  }

  let userUpdate = {};
  if(newEmail) userUpdate.email = newEmail;
  if(newUserName) userUpdate.username = newUserName;
  if (newPassword === newPasswordConf) {
    userUpdate.cd = newPassword;
    userUpdate.passwordConf = newPasswordConf;
  }
  try{
    const user = await User.findByIdAndUpdate(req.session.userId, {$set: userUpdate})
    if (!user) return next(new Error("User does not exist"));
    req.flash("notification", `${newUserName} is now updated`);
    res.redirect("/users");

  } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
  }
};

// DELETE route PROFILE EDIT PAGE
exports.deleteUser = async(req, res, next) => {
  var userId = req.params.userId;
  try{
    const user = await User.findByIdAndRemove(userId);
    if(!user) return next(new Error("This user does not exist"));
    req.flash("notification", user.username + " was removed");
    res.status(200).json({ message: "Post removed" });
  } catch(err) {
    res.status(500).json({ message: "Error in deleting user" });
  }

};




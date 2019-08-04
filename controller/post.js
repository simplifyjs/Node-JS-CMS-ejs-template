const Post = require("../models/post");
const { validationResult } = require("express-validator/check");
const ITEMS_PER_PAGE = 2;
let totalItems, page;

exports.getPosts = async(req, res, next) => {
  var message = req.flash("notification");
      page = +req.query.page || 1;
    
    try {
      const posts = Post.find().countDocuments();
      const numProducts = await Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
  
        totalItems = numProducts;
  
        res.render("post/post-list", {
          pageTitle: "Post",
          posts: posts,
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
      
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
};

exports.getPosts = async(req, res, next) => {
  var message = req.flash("notification");
      page = +req.query.page || 1;
  try {
    const numProducts = await Post.find().countDocuments();
    const posts = await Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
  
    totalItems = numProducts;
  
    res.render("post/post-list", {
      pageTitle: "Post",
      posts: posts,
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
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};

exports.getPostDetail = async(req, res, next) => {
  var message = req.flash("notification");
  try {
    const post = await Post.findById(req.params.postId);
    res.render("post/post-detail", {
      pageTitle: post.title,
      post: post,
      errMessage: message.length > 0 ? message[0] : null
    });
  } catch(err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);   
  }

};
exports.getAddPost = (req, res, next) => {
  let message = req.flash("notification");

  return res.render("post/add-post", {
    pageTitle: "Add Post",
    oldInput: {
      title: '',
      description: ''
    },
    errMessage: message.length > 0 ? message[0] : null,
    errFields: {
      errTitle:  '',
      errDesc: ''
    }
  });
};

exports.postAddPost = async(req, res, next) => {
  if (!req.session.userId) {
    const error = new Error("Access Denied");
    error.status = 402;
    next(error);
  }
  const author = req.session.userId,
        title = req.body.title,
        description = req.body.description;

  let valError = validationResult(req),
    errArray = valError.array();

  if (!valError.isEmpty()) {
    let eTitle, eDesc;
    errArray.forEach(i => {
      switch(i.param) {
        case 'title':
          eTitle = i.msg;
          break;
        case 'description':
          eDesc = i.msg;
        break;
      }
    })

    return res.render("post/add-post", {
      pageTitle: "Post",
      oldInput: {
        title,
        description,
      },
      errFields: {
        errTitle: eTitle,
        errDesc: eDesc,
      }
    });
  }

  var post = new Post({
    title: title,
    description: description,
    author: {
      userId: author
    }
  });

  try {
    const result = await post.save();
    if(result) {
      req.flash("notification", "New post added");
      res.redirect("/posts");
    }
  } catch(err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditPost = async (req, res, next) => {
  try{
    const post = await Post.findOne({
      _id: req.params.postId,
      author: { userId: req.session.userId }
    })
    return res.render("post/edit-post", {
      pageTitle: "Edit post",
      post: post,
      errFields: {
        errTitle: '',
        errDesc: '',
      }
    });
  } catch(err) {
    return next(err);
  }
};

exports.postEditPost = async (req, res, next) => {
  if (!req.session.userId) {
    const error = new Error("Access Denied");
    error.status = 402;
    next(error);
  }

  let valError = validationResult(req),
    errArray = valError.array();

  const post = await Post.findOne({ _id: req.body.postId, author: { userId: req.session.userId } });
  if (!post) return next(new Error("Not authorize"));

  post.title = req.body.title;
  post.description = req.body.description;

  if (!valError.isEmpty()) {
    let eTitle, eDesc;
    errArray.forEach(i => {
      switch(i.param) {
        case 'title':
          eTitle = i.msg;
          break;
        case 'description':
          eDesc = i.msg;
        break;
      }
    })

    return res.render("post/edit-post", {
      pageTitle: "Edit post",
      errFields: {
        errTitle: eTitle,
        errDesc: eDesc,
      },
      post: post
    });
  }

  try {
    const result = await post.save();
    if(result) {
      req.flash("notification", result.title + " edited successfully");
      res.redirect("/posts/" + req.body.postId);
    }
  } catch(err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deletePost = async(req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findByIdAndRemove(postId);
    if (post) {
      res.status(200).json({message: 'Post removed'});
    }
  } catch(err) {
    res.status(500).json({message: 'Error in deleting post'});
  }
};

exports.getAuthorPost = async(req, res, next) => {
  if (!req.session.userId) {
    var error = new Error("Access Denied");
    error.status = 402;
    next(error);
  }

  var message = req.flash("notification");
      page = +req.query.page || 1;

  try {
    const postCount = await Post.find().countDocuments();
    const posts = await Post.find({ author: { userId: req.session.userId } })
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE);
  
    totalItems = postCount;
    return res.render("post/post-list", {
      pageTitle: "Post",
      posts: posts,
      errMessage: message.length > 0 ? message[0] : null,
      totalItems: totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
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
    return next(error);
  }
};

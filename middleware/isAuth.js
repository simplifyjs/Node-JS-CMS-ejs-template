module.exports = (req, res, next) => {
  if (!req.session.userId) {
    var err = new Error("Not authorized! Go back!");
    err.status = 400;
    return res.render("error", {
      pageTitle: "Access Denied",
      errorStatus: err.status,
      errMessage: err
    });
  }
  next();
};

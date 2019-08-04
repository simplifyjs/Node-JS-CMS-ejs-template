exports.notAuthorizeErr = (req, res, next) => {

  const message = req.flash('Not authorized! Go back! :P');
  if (message.length > 0) {
    return message;
  } else {
   return message = null;
  }
}
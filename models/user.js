const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 5;

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpire: Date,
  loginAttempts: {
    type: Number,
    required: true
  },
  lockUntil: {
    type: Number
  },
  role: {
    type: Number
  },
});

  //authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      // Check if the password was match from the database
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null);
        }
      })
    });
}

// Hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.genSalt(SALT_ROUNDS,  (err, salt) => {
    if (err) next(err); 
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
     next();
    })
  });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;

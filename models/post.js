const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
});

module.exports = mongoose.model('Post', postSchema);

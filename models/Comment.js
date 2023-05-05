const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;

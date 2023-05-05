const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    photo: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model('post', postSchema);
module.exports = Post;

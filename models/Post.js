const mongoose = require('mongoose');
const Comment = require('./Comment');

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

postSchema.pre('remove', async function (next) {
  try {
    await Comment.deleteMany({ post: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Post = mongoose.model('post', postSchema);
module.exports = Post;

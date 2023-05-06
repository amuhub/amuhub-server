const mongoose = require('mongoose');
const Answer = require('./Answer');

const quesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    ques: {
      type: String,
      required: true,
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tag',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  { timestamps: true }
);

quesSchema.pre('remove', async function (next) {
  try {
    await Answer.deleteMany({ ques: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Ques = mongoose.model('ques', quesSchema);
module.exports = Ques;

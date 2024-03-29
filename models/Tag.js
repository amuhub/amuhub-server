const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Tag = mongoose.model('tag', tagSchema);
module.exports = Tag;

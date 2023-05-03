const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  pic: {
    type: String,
    default:
      'https://res.cloudinary.com/dtt5pe9sl/image/upload/v1662442630/amuhub/default_powath.jpg',
  },
  bio: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
    },
  ],
  department: {
    type: String,
  },
  location: {
    type: String,
  },
  interest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tag',
    },
  ],
});

const Profile = mongoose.model('profile', profileSchema);
module.exports = Profile;

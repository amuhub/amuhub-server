import mongoose from 'mongoose';
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    follower: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function() {
  const payload = {
      user:{
          id: this._id,
          username: this.username
      }
  }

  const token = jwt.sign(payload, process.env.SECRET_KEY,{expiresIn: 360000});
  return token
}


const User = mongoose.model('user',userSchema);

export default User;
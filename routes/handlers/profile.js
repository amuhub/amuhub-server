const get_response_dict = require('../../utils/response');
const User = require("../../models/User");

// Define your route handler as a function that accepts a session argument
const followUser = async (req, res, session) => {
    const other_user = await User.findOne({ username: req.params.username }).session(session);
    if (!other_user) {
      const response = get_response_dict(401, "User not found", null);
      return res.status(401).json(response);
    }
  
    if (other_user.follower.includes(req.user.id)) {
      const response = get_response_dict(401, "Already following", null);
      return res.status(401).json(response);
    }
  
    other_user.follower.push(req.user.id);
    await other_user.save();
  
    const current_user = await User.findById(req.user.id).session(session);
    current_user.following.push(other_user.id);
    await current_user.save();
  
    const response = get_response_dict(200, "User followed", current_user);
    return res.status(201).json(response);
  };


module.exports = { followUser };
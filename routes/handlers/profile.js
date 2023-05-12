const get_response_dict = require('../../utils/response');
const User = require('../../models/User');
const { createNotification } = require('../../services/notification');
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../../utils/constants');

// Define your route handler as a function that accepts a session argument
const toggleFollowUser = async (req, res, session) => {
  const other_user = await User.findOne({
    username: req.params.username,
  }).session(session);
  if (!other_user) {
    const response = get_response_dict(401, 'User not found', null);
    return res.status(401).json(response);
  }

  if (other_user.follower.includes(req.user.id)) {
    // remove from other_user's followers
    other_user.follower.pull(req.user.id);
    await other_user.save();

    // remove from current_user's following
    const current_user = await User.findById(req.user.id).session(session);
    current_user.following.pull(other_user.id);
    await current_user.save();

    // showing updated user
    let otherUserData = other_user.toJSON();
    otherUserData.isFollowing = false;
    const response = get_response_dict(200, 'User unfollowed', otherUserData);
    return res.status(201).json(response);
  }

  other_user.follower.push(req.user.id);
  await other_user.save();

  const current_user = await User.findById(req.user.id).session(session);
  current_user.following.push(other_user.id);
  await current_user.save();

  // showing updated user
  let otherUserData = other_user.toJSON();
  otherUserData.isFollowing = true;

  // create notification
  if (other_user._id !== req.user.id) {
    createNotification({
      receiver: other_user._id,
      sender: req.user.id,
      type: NotificationTypes.profile,
      action: NotificationTypeActionMapping.profile.follow,
      item_id: current_user.username,
    });
  }
  const response = get_response_dict(200, 'User followed', otherUserData);
  return res.status(201).json(response);
};

module.exports = { toggleFollowUser };

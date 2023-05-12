const Notification = require('../models/Notification');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { NotificationTypeActionMapping } = require('../utils/constants');

const createNotification = async ({
  receiver,
  sender,
  type,
  action,
  item_id,
}) => {
  try {
    const notification = new Notification({
      receiver: receiver,
      sender: sender,
      type: type,
      action: action,
      item_id: item_id,
    });
    await notification.save();
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getNotificationData = async (notification) => {
  sender = await User.findById(notification.sender).select('username');
  sender = sender.toJSON();
  sender.profile = await Profile.findOne({ user: notification.sender }).select(
    'pic'
  );

  let type = notification.type;
  // if type is profile and action is (liked or commented on), then change type to post
  if (
    notification.type === 'profile' &&
    ['liked', 'commented on'].includes(notification.action)
  ) {
    type = 'post';
  }

  return {
    id: notification._id,
    receiver: notification.receiver,
    sender: sender,
    type: notification.type,
    action: notification.action,
    redirectUrl: `${notification.type}/${notification.item_id}`,
    message: `${sender.username} ${notification.action} your ${type}`,
    isViewed: notification.isViewed,
    isViewedAt: notification.isViewedAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

const getNotificationforUser = async (userId) => {
  try {
    const notifications = await Notification.find({ receiver: userId }).sort({
      createdAt: -1,
    });
    console.log('Notifications fetched');
    return notifications;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const deleteAllOldNotifications = async () => {
  const currentTime = new Date();
  const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
  await Notification.deleteMany({
    isViewed: true,
    $and: [
      { isViewedAt: { $exists: true } },
      { isViewedAt: { $lt: oneHourAgo } },
    ],
  });
  console.log('Old notifications deleted');
};

// delete all notifications with created at older than a month
const deleteAllUnviewedNotifications = async () => {
  const currentTime = new Date();
  const oneMonthAgo = new Date(
    currentTime.getTime() - 30 * 24 * 60 * 60 * 1000
  );
  await Notification.deleteMany({ createdAt: { $lt: oneMonthAgo } });
  console.log('Unviewed notifications deleted');
};

const viewNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);
    console.log(notification.receiver.toString());
    console.log(userId);
    if (notification.receiver.toString() !== userId) {
      console.log('not authorized');
      return null;
    }
    if (!notification.isViewed) {
      notification.isViewed = true;
      notification.isViewedAt = new Date();
      await notification.save();
    }
    return notification;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

module.exports = {
  createNotification,
  getNotificationData,
  getNotificationforUser,
  deleteAllOldNotifications,
  deleteAllUnviewedNotifications,
  viewNotification,
};

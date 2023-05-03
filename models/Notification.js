const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../utils/constants');

const notificationSchema = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    type: {
      type: String,
      enum: ['post', 'question', 'answer', 'profile'],
      required: true,
    },
    action: { type: String, required: true },
    item_id: { type: String, required: true },
    isViewed: { type: Boolean, default: false },
    isViewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.path('action').validate(function (value) {
  if (
    !Object.values(NotificationTypeActionMapping[this.type]).includes(value)
  ) {
    return false;
  }
  return true;
}, 'Invalid action for the notification type.');

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;

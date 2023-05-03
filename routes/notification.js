const express = require('express');
const dotenv = require('dotenv');
const { auth, authAdmin, authOptional } = require('../middleware/auth');
const router = express.Router();
const get_response_dict = require('../utils/response');
const User = require('../models/User');
const {
  createNotification,
  getNotificationData,
  getNotificationforUser,
  deleteAllOldNotifications,
  viewNotification,
} = require('../services/notification');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await getNotificationforUser(req.user.id);

    notifications_list = [];
    for (let i = 0; i < notifications.length; i++) {
      notifications_list.push(await getNotificationData(notifications[i]));
    }
    const response = get_response_dict(
      200,
      'Notifications fetched',
      notifications_list
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/view/:id', auth, async (req, res) => {
  try {
    const notification = await viewNotification(req.params.id, req.user.id);
    if (!notification) {
      const response = get_response_dict(401, 'Notification not found', null);
      return res.status(401).json(response);
    }
    const response = get_response_dict(
      200,
      'Notification viewed',
      notification
    );
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

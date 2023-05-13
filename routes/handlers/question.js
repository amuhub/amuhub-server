const Question = require('../../models/Question');
const get_response_dict = require('../../utils/response');
const { createNotification } = require('../../services/notification');
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../../utils/constants');

const upvoteQuestion = async (req, res, session) => {
  const question = await Question.findOne(
    {
      _id: req.params.id,
    },
    null,
    { session, selectForUpdate: true }
  );

  if (!question) {
    const response = get_response_dict(401, 'Question not found', null);
    return res.status(401).json(response);
  }

  // if already upvoted by user
  if (question.upvotes.includes(req.user.id)) {
    question.upvotes.pull(req.user.id);
    await question.save({ session });
    const response = get_response_dict(200, 'Upvote Removed',question);
    return res.status(201).json(response);
  }

  // if previously downvoted by user
  if (question.downvotes.includes(req.user.id)) {
    question.downvotes.pull(req.user.id);
  }

  question.upvotes.push(req.user.id);
  await question.save({ session });

  // create notification
  if (question.user.toString() !== req.user.id) {
    createNotification({
      receiver: question.user,
      sender: req.user.id,
      type: NotificationTypes.question,
      action: NotificationTypeActionMapping.question.upvote,
      item_id: question._id,
    });
  }

  const response = get_response_dict(200, 'Question upvoted', question);
  return res.status(201).json(response);
};

const downvoteQuestion = async (req, res, session) => {
  const question = await Question.findOne(
    {
      _id: req.params.id,
    },
    null,
    { session, selectForUpdate: true }
  );
  if (!question) {
    const response = get_response_dict(401, 'Question not found', null);
    return res.status(401).json(response);
  }

  // check if already downvoted
  if (question.downvotes.includes(req.user.id)) {
    question.downvotes.pull(req.user.id);
    await question.save({ session });
    const response = get_response_dict(200, 'Downvote Removed', question);
    return res.status(201).json(response);
  }

  // check if already upvoted
  if (question.upvotes.includes(req.user.id)) {
    question.upvotes.pull(req.user.id);
  }

  question.downvotes.push(req.user.id);
  await question.save({ session });

  // create notification
  if (question.user.toString() !== req.user.id) {
    createNotification({
      receiver: question.user,
      sender: req.user.id,
      type: NotificationTypes.question,
      action: NotificationTypeActionMapping.question.downvote,
      item_id: question._id,
    });
  }

  const response = get_response_dict(200, 'Question downvoted', question);
  return res.status(201).json(response);
};

module.exports = { upvoteQuestion, downvoteQuestion };

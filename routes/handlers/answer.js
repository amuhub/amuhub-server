const Answer = require('../../models/Answer');
const get_response_dict = require('../../utils/response');
const { createNotification } = require('../../services/notification');
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../../utils/constants');


const upvoteAnswer = async (req, res, session) => {
    const answer = await Answer.findOne(
        {
            _id: req.params.id,
        },
        null,
        { session, selectForUpdate: true }
    );

    if (!answer) {
      const response = get_response_dict(401, 'Answer not found', null);
      return res.status(401).json(response);
    }

    // check if user has already upvoted
    if (answer.upvotes.includes(req.user.id)) {
        answer.upvotes.pull(req.user.id);
        await answer.save({ session });
        const response = get_response_dict(401, 'Upvote Removed', null);
        return res.status(401).json(response);
    }

    // if previously downvoted, remove downvote
    if (answer.downvotes.includes(req.user.id)) {
      answer.downvotes.pull(req.user.id);
    }

    answer.upvotes.push(req.user.id);
    await answer.save({ session });

    // create notification
    if (answer.user.toString() !== req.user.id) {
        createNotification({
            receiver: answer.user,
            sender: req.user.id,
            type: NotificationTypes.question,
            action: NotificationTypeActionMapping.answer.upvote,
            item_id: answer.ques,
        });
    }
    const response = get_response_dict(201, 'Answer upvoted', answer);
    return res.status(201).json(response);
};


const downvoteAnswer = async (req, res, session) => {
    const answer = await Answer.findOne(
        {
            _id: req.params.id,
        },
        null,
        { session, selectForUpdate: true }
    );

    if (!answer) {
        const response = get_response_dict(401, 'Answer not found', null);
        return res.status(401).json(response);
    }

    // check if user has already downvoted
    if (answer.downvotes.includes(req.user.id)) {
        answer.downvotes.pull(req.user.id);
        await answer.save({ session });
        const response = get_response_dict(401, 'Downvote Removed', null);
        return res.status(401).json(response);
    }

    // if previously upvoted, remove upvote
    if (answer.upvotes.includes(req.user.id)) {
        answer.upvotes.pull(req.user.id);
    }

    answer.downvotes.push(req.user.id);
    await answer.save({ session });

    // create notification
    if (answer.user.toString() !== req.user.id) {
        createNotification({
            receiver: answer.user,
            sender: req.user.id,
            type: NotificationTypes.question,
            action: NotificationTypeActionMapping.answer.downvote,
            item_id: answer.ques,
        });
    }

    const response = get_response_dict(201, 'Answer downvoted', answer);
    return res.status(201).json(response);
};


module.exports = { upvoteAnswer, downvoteAnswer };
    
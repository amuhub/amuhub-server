const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { auth, authAdmin } = require('../middleware/auth');
const router = express.Router();
const get_response_dict = require('../utils/response');
const validateAnswer = require('../utils/validateAnswer');
const { createNotification } = require('../services/notification');
const { withTransaction } = require('../middleware/db');
const { upvoteAnswer, downvoteAnswer } = require('./handlers/answer');
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../utils/constants');

// post answer
router.post('/', auth, async (req, res) => {
  // validate answer
  const result = validateAnswer(req.body);
  if (result.error) {
    const response = get_response_dict(401, 'Validation error', {
      error: result.error.details[0].message,
    });
    return res.status(400).json(response);
  }
  try {
    // create answer object
    const answerData = {
      text: req.body.text,
      user: req.user.id,
      ques: req.body.ques,
    };

    const answer = new Answer(answerData);
    await answer.save();

    // create notification
    question = await Question.findOne({ _id: req.body.ques });

    if (question.user.toString() !== req.user.id) {
      createNotification({
        receiver: question.user,
        sender: req.user.id,
        type: NotificationTypes.question,
        action: NotificationTypeActionMapping.question.answer,
        item_id: question._id,
      });
    }
    const response = get_response_dict(201, 'Answer posted', answer);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// upvote answer
router.post('/upvote/:id', auth, withTransaction(upvoteAnswer));

// downvote answer
router.post('/downvote/:id', auth, withTransaction(downvoteAnswer));

// edit answer
router.put('/edit/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      const response = get_response_dict(401, 'Answer not found', null);
      return res.status(401).json(response);
    }

    // check if user is the author of the answer
    if (answer.user.toString() !== req.user.id) {
      const response = get_response_dict(401, 'Not authorized', null);
      return res.status(401).json(response);
    }

    // update answer
    answer.text = req.body.text;
    await answer.save();
    const response = get_response_dict(201, 'Answer updated', answer);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// delete answer
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      const response = get_response_dict(401, 'Answer not found', null);
      return res.status(401).json(response);
    }

    // check if user is the author of the answer
    if (answer.user.toString() !== req.user.id) {
      const response = get_response_dict(401, 'Not authorized', null);
      return res.status(401).json(response);
    }

    await answer.remove();
    const response = get_response_dict(201, 'Answer deleted', null);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;

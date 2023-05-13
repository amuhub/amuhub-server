const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth, authAdmin } = require('../middleware/auth');
const router = express.Router();
const get_response_dict = require('../utils/response');
const validateQuestion = require('../utils/validateQuestion');
const Profile = require('../models/Profile');
const Tag = require('../models/Tag');
const { withTransaction } = require('../middleware/db');
const { upvoteQuestion, downvoteQuestion } = require('./handlers/question');

// post question
router.post('/', auth, async (req, res) => {
  const result = validateQuestion(req.body);
  if (result.error) {
    const response = get_response_dict(401, 'Validation error', {
      error: result.error.details[0].message,
    });
    return res.status(400).json(response);
  }

  try {
    // check if tags exist
    const tagID = req.body.tag;
    const tagExists = await Tag.findById(tagID);
    if (!tagExists) {
      const response = get_response_dict(
        401,
        'Invalid Tag',
        'Tag does not exist'
      );
      return res.status(401).json(response);
    }

    // creating question
    const questionData = {
      ques: req.body.ques,
      tag: req.body.tag,
      user: req.user.id,
    };

    const question = new Question(questionData);
    await question.save();

    const response = get_response_dict(201, 'Question posted', question);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// get a question
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('tag').populate('user', 'username name');
    if (!question) {
      const response = get_response_dict(401, 'Question not found', null);
      return res.status(401).json(response);
    }
    // get all answers for this question
    let answer_list = [];
    const answers = await Answer.find({ ques: req.params.id }).populate(
      'user',
      'username name'
    );
    for (let i = 0; i < answers.length; i++) {
      let answer = answers[i].toJSON();
      answer.user.profile = await Profile.findOne({
        user: answer.user._id,
      }).select('pic');
      answer_list.push(answer);
    }

    // get profile for user
    const profile = await Profile.findOne({ user: question.user }).select(
      'pic'
    );

    // convert question to json
    let questionData = question.toJSON();
    questionData.answers = answer_list;
    questionData.user.profile = profile;

    const response = get_response_dict(200, 'Question found', questionData);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// get all questions filtered acc toe tags
router.get('/', auth, async (req, res) => {
  try {
    // latest questions
    if (req.query.tag) {
      const tagID = req.query.tag;
      const questions = await Question.find({ tag: tagID })
        .populate('tag')
        .sort({ createdAt: -1 });
    } else {
      const questions = await Question.find()
        .populate('tag')
        .sort({ createdAt: -1 });
    }

    if (!questions) {
      const response = get_response_dict(401, 'Questions not found', null);
      return res.status(401).json(response);
    }

    // get profile for user for each question
    let questionsList = [];
    for (let i = 0; i < questions.length; i++) {
      const profile = await Profile.findOne({ user: questions[i].user });
      let questionData = questions[i].toJSON();
      questionData.profile = profile;
      questionsList.push(questionData);
    }

    const response = get_response_dict(200, 'Questions found', questionsList);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// get questions which have tags in common with user's profile's interests
router.get('/interests/tags/', auth, async (req, res) => {
  try {
    // get user profile
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      const response = get_response_dict(401, 'Profile not found', null);
      return res.status(401).json(response);
    }
    // get all questions with tags in common with user's profile's interests
    const questions = await Question.find({ tag: { $in: profile.interest } })
      .populate('user', 'username name')
      .populate('tag')
      .sort({ createdAt: -1 });
    if (!questions) {
      const response = get_response_dict(401, 'Questions not found', null);
      return res.status(401).json(response);
    }

    // get profile for user for each question
    let questionsList = [];
    for (let i = 0; i < questions.length; i++) {
      const profile = await Profile.findOne({
        user: questions[i].user._id,
      }).select('pic');
      let questionData = questions[i].toJSON();
      questionData.user.profile = profile;
      questionData.answer_count = await Answer.countDocuments({
        ques: questionData._id,
      });
      questionsList.push(questionData);
    }

    const response = get_response_dict(200, 'Questions found', questionsList);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// upvote a question+
router.post('/upvote/:id', auth, withTransaction(upvoteQuestion));

// downvote a question
router.post('/downvote/:id', auth, withTransaction(downvoteQuestion));

// delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      const response = get_response_dict(401, 'Question not found', null);
      return res.status(401).json(response);
    }
    if (question.user.toString() !== req.user.id) {
      const response = get_response_dict(401, 'Not authorized', null);
      return res.status(401).json(response);
    }
    await question.remove();
    const response = get_response_dict(200, 'Question deleted', null);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;

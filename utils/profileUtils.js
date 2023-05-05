const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const getAnswerforUser = async (userId) => {
  try {
    const answers = await Answer.find({ user: userId });
    return answers;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getQuestionforUser = async (userId) => {
  try {
    const questions = await Question.find({ user: userId })
      .populate('tag', 'name')
      .sort({ createdAt: -1 });
    return questions;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getPostforUser = async (userId) => {
  try {
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    var posts_list = [];
    for (var i = 0; i < posts.length; i++) {
      var postData = posts[i].toJSON();
      const comments = await Comment.find({ post: posts[i]._id }).select('_id');
      postData.comments = comments;
      posts_list.push(postData);
    }
    return posts_list;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

module.exports = { getAnswerforUser, getQuestionforUser, getPostforUser };

const Answer = require('../models/Answer');
const Question = require('../models/Question');

const getAnswerforUser = async (userId) => {
    try{
        const answers = await Answer.find({user: userId});
        return answers;
    } catch(err){
        console.error(err.message);
        return null;
    }
}

const getQuestionforUser = async (userId) => {
    try{
        const questions = await Question.find({user: userId});
        return questions;
    } catch(err){
        console.error(err.message);
        return null;
    }
}

const getPostforUser = async (userId) => {
    try{
        const posts = await Post.find({user: userId});
        return posts;
    } catch(err){
        console.error(err.message);
        return null;
    }
}

module.exports = { getAnswerforUser, getQuestionforUser, getPostforUser };
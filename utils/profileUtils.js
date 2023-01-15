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

module.exports = { getAnswerforUser, getQuestionforUser };
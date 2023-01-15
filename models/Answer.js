const mongoose = require('mongoose');

const ansSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    ques:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'ques'
    },
    text:{
        type: String,
        required: true
    },
    upvotes:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    downvotes:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
},{timestamps:true})

const Answer = mongoose.model('answer',ansSchema)
module.exports = Answer;

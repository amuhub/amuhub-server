import mongoose from "mongoose";

const ansSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
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
export default Answer;

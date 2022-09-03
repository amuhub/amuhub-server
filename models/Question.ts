import mongoose from "mongoose";

const quesSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    ques:{
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
    ],
    answer:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'answer'
        }
    ]
},{timestamps:true})

const Ques = mongoose.model('ques',quesSchema)
export default Ques;
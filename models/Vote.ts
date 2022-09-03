import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    thumbs:{
        type: String,
        required: true,
        enum:['up','down']
    }
},{timestamps:true})

const Vote = mongoose.model('vote',voteSchema);
export default Vote;
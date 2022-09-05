const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
},{timestamps:true})

const Like = mongoose.model('like',likeSchema);
module.exports = Like;
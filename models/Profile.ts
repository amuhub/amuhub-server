import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    pic:{ 
        data: Buffer, 
        contentType: String 
    },
    bio:{
        type: String
    },
    department:{
        type: String
    },
    location:{
        type: String
    },
    interest: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'tag'
        }
    ],
})

const Profile = mongoose.model('profile',profileSchema)
export default Profile;
const express = require("express");
const dotenv = require("dotenv")
const Profile = require("../models/Profile")
const Question = require("../models/Question")  
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { auth, authAdmin } = require('../middleware/auth')
const validateProfile = require('../utils/validateProfile');
const router = express.Router();
const get_response_dict = require('../utils/response');
const { getAnswerforUser, getQuestionforUser, getPostforUser } = require('../utils/profileUtils');
const User = require("../models/User");

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder : "amuhub",
    }
});

const upload = multer({storage: storage});

router.put("/photo", auth, async (req,res) => {
    try{
        // update pic
        const path = req.body.path;
        const profile = await Profile.findOne({user : req.user.id});
        profile.pic = path;
        await profile.save();
        const response = get_response_dict(200, "Profile photo updated", profile)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    } 
})

router.put("/edit", auth, async (req,res) => {
    try{
        // update profile
        const result = validateProfile(req.body);
        if(result.error){
            const response = get_response_dict(401, "Validation error", {error: result.error.details[0].message})
            return res.status(400).json(response);
        }
        const profile = await Profile.findOne({user : req.user.id});
        profile.location = req.body.location;
        profile.bio = req.body.bio;
        profile.department = req.body.department;
        profile.interest = req.body.interest;
        await profile.save();
        const response = get_response_dict(200, "Profile updated", profile)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})


router.get("/me", auth, async (req,res) => {
    try{
        // get user
        const current_user = await User.findById(req.user.id);
        const profile = await Profile.findOne({user: current_user.id});

        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        
        // convert profile to json
        var profileData = profile.toJSON();
        profileData.username = current_user.username;
        profileData.name = current_user.name;


        // get searched_user's followers and following
        profileData.follower = current_user.follower;
        profileData.following = current_user.following;

        const response = get_response_dict(200, "Profile found", profileData)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

router.get("/:username", async (req,res) => {
    try{
        // get user
        const searched_user = await User.findOne({username : req.params.username});
        const profile = await Profile.findOne({user: searched_user.id}).populate("interest", "name");

        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        
        // convert profile to json
        var profileData = profile.toJSON();
        profileData.username = searched_user.username;
        profileData.name = searched_user.name;

        // get searched_user's followers and following
        profileData.follower = searched_user.follower;
        profileData.following = searched_user.following;

        const response = get_response_dict(200, "Profile found", profileData)
        return res.status(200).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

router.get("/:username/answers", async (req,res) => {
    try{
        // get user
        const searched_user = await User.findOne({username : req.params.username});
        const profile = await Profile.findOne({user: searched_user.id});

        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        
        // get answers
        const answers = await getAnswerforUser(searched_user.id);

        // get questions for every answer
        var answerList = [];
        for (var i = 0; i < answers.length; i++){
            var answer = answers[i].toJSON();
            var question = await Question.findById(answer.ques);
            const askedByProfile = await Profile.findOne({user: question.user});
            const askedByUser = await User.findById(question.user);
            answer.question = question;
            answer.askedByProfile = askedByProfile;
            answer.askedByUser = askedByUser;
        
            answerList.push(answer);
        }
        const response = get_response_dict(200, "Answers found", answerList)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

router.get("/:username/questions", async (req,res) => {
    try{
        // get user
        const searched_user = await User.findOne({username : req.params.username});
        const profile = await Profile.findOne({user: searched_user.id});

        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        
        // get questions
        const questions = await getQuestionforUser(searched_user.id);
        const response = get_response_dict(200, "Questions found", questions)
        return res.status(201).json(response);
    }
    catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

router.get("/:username/posts", async (req,res) => {
    try{
        // get user
        const searched_user = await User.findOne({username : req.params.username});
        const profile = await Profile.findOne({user: searched_user.id});

        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        
        // get posts
        const posts = await getPostforUser(searched_user.id);
        const response = get_response_dict(200, "Posts found", posts)
        return res.status(201).json(response);
    }
    catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

//follow user
router.put("/follow/:username", auth, async (req,res) => {
    try{
        // get user
        const other_user = await User.findOne({username : req.params.username});
        if(!other_user){
            const response = get_response_dict(401, "User not found", null)
            return res.status(401).json(response);
        }
        // check if already following
        if(other_user.followers.includes(req.user.id)){
            const response = get_response_dict(401, "Already following", null)
            return res.status(401).json(response);
        }

        // add to user's followers
        other_user.followers.push(req.user.id);
        await other_user.save();

        // add to other_user's following
        const current_user = await User.findById(req.user.id);
        current_user.following.push(other_user.id);
        await current_user.save();

        const response = get_response_dict(200, "User followed", current_user)
        return res.status(201).json(response);
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});

//unfollow user
router.put("/unfollow/:username", auth, async (req,res) => {
    try{
        // get user
        const other_user = await User.findOne({username : req.params.username});
        if(!other_user){
            const response = get_response_dict(401, "User not found", null)
            return res.status(401).json(response);
        }
        // check if already following
        if(!other_user.followers.includes(req.user.id)){
            const response = get_response_dict(401, "Not following", null)
            return res.status(401).json(response);
        }

        // remove from other_user's followers
        other_user.followers.pull(req.user.id);
        await other_user.save();

        // remove from current_user's following
        const current_user = await User.findById(req.user.id)
        current_user.following.pull(other_user.id);
        await current_user.save();

        // showing updated user
        const response = get_response_dict(200, "User unfollowed", current_user )
        return res.status(201).json(response);
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});

module.exports = router;
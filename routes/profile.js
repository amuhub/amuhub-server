const express = require("express");
const dotenv = require("dotenv")
const Profile = require("../models/Profile")
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { auth, authAdmin } = require('../middleware/auth')
const validateProfile = require('../utils/validateProfile');
const router = express.Router();
const get_response_dict = require('../utils/response');
const { getAnswerforUser, getQuestionforUser } = require('../utils/profileUtils');

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

router.put("/photo", [ auth, upload.single("photo") ], async (req,res) => {
    try{
        // update pic
        const path = req.file.path
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
        // get profile
        const profile = await Profile.findOne({user : req.user.id});
        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }

        // get answers for user
        const answers = await getAnswerforUser(req.user.id);
        const questions = await getQuestionforUser(req.user.id);

        console.log(answers)
        console.log(questions)
        
        // convert profile to json
        var profileData = profile.toJSON();
        profileData.answers = answers;
        profileData.questions = questions;

        console.log(profileData)
        const response = get_response_dict(200, "Profile found", profileData)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})


router.get("/:username", async (req,res) => {
    try{
        // get profile
        const profile = await Profile.findOne({username : req.params.username});
        if(!profile){
            const response = get_response_dict(401, "Profile not found", null)
            return res.status(401).json(response);
        }
        const response = get_response_dict(200, "Profile found", profile)
        return res.status(201).json(response);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

module.exports = router;
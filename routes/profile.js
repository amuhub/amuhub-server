const express = require("express");
const dotenv = require("dotenv")
const Profile = require("../models/Profile")
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const auth = require('../middleware/auth');
const router = express.Router();

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
        return res.status(201).json(profile);
    } catch (err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
    
})

module.exports = router;
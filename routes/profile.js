const express = require("express");
const dotenv = require("dotenv")
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
// const cloud = require('../utils/cloud');
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

router.post("/photo", upload.single("photo"), async (req,res) => {
    console.log(req.file.path)
    res.send("works")
})

module.exports = router;
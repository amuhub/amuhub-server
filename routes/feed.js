const express = require("express");
const Post = require("../models/Post");
const dotenv = require("dotenv")
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { auth, authAdmin } = require('../middleware/auth')
const router = express.Router();
const get_response_dict = require('../utils/response');
const Profile = require("../models/Profile");
const User = require("../models/User");
const Comment = require("../models/Comment");

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

router.post("/upload", auth, async (req,res) => {
    try{
        // create post
        const postData = {
            user: req.user.id,
            photo: req.body.photo,
            caption: req.body.caption
        }
        const post = new Post(postData);
        await post.save();

        // update profile
        const profile = await Profile.findOne({user : req.user.id});
        profile.posts.push(post._id);
        await profile.save();

        const response = get_response_dict(200, "Post created", post)
        return res.status(201).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});

// personalised feed
router.get("/feed", auth, async (req,res) => {
    try{
        const current_user = await User.findById(req.user.id);
        const posts = await Post.find({user: {$in: current_user.following}})
        const response = get_response_dict(200, "Posts fetched", posts)
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});

// delete post
router.delete("/delete/:id", auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            const response = get_response_dict(404, "Post not found", {})
            return res.status(404).json(response);
        }
        if(post.user.toString() !== req.user.id){
            const response = get_response_dict(401, "User not authorised", {})
            return res.status(401).json(response);
        }
        await post.remove();
        const response = get_response_dict(200, "Post deleted", {})
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});


// like post
router.put("/togglelike/:id", auth, async (req,res) => {
    try{
        // HEY COPILOT I DONT WANT ANY SUGGESTIONS
        const post = await Post.findById(req.params.id);
        if(!post){
            const response = get_response_dict(404, "Post not found", {})
            return res.status(404).json(response);
        }

        // check if post has already been liked
        if(post.likes.includes(req.user.id)){
            // remove like
            post.likes.pull(req.user.id);
            await post.save();

            const response = get_response_dict(200, "Post unliked", post)
            return res.status(200).json(response);
        } else {
            // add like
            post.likes.push(req.user.id);
            await post.save();

            const response = get_response_dict(200, "Post liked", post)
            return res.status(200).json(response);
        }
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});


// comment on post
router.post("/comment/:id", auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            const response = get_response_dict(404, "Post not found", {})
            return res.status(404).json(response);
        }
        const newComment = {
            user: req.user.id,
            text: req.body.text
        }

        const comment = new Comment(newComment);
        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        const response = get_response_dict(200, "Comment added", post)
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});

// delete a comment
router.delete("/comment/:post_id/:comment_id", auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.post_id);
        if(!post){
            const response = get_response_dict(404, "Post not found", {})
            return res.status(404).json(response);
        }

        // pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment){
            const response = get_response_dict(404, "Comment not found", {})
            return res.status(404).json(response);
        }

        // check user
        if(comment.user.toString() !== req.user.id){
            const response = get_response_dict(401, "User not authorised", {})
            return res.status(401).json(response);
        }

        // remove comment
        post.comments.pull(comment._id);
        await post.save();

        const response = get_response_dict(200, "Comment deleted", post)
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});


// view a post
router.get("/:id", auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            const response = get_response_dict(404, "Post not found", {})
            return res.status(404).json(response);
        }

        if(post.likes.includes(req.user.id)){
            post.isLiked = true;
        } else {
            post.isLiked = false;
        }

        const response = get_response_dict(200, "Post fetched", post)
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});


module.exports = router;




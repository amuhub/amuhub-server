const express = require('express');
const Post = require('../models/Post');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { auth, authAdmin } = require('../middleware/auth');
const router = express.Router();
const get_response_dict = require('../utils/response');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { createNotification } = require('../services/notification');
const {
  NotificationTypeActionMapping,
  NotificationTypes,
} = require('../utils/constants');

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'amuhub',
  },
});

const upload = multer({ storage: storage });

router.post('/upload', auth, async (req, res) => {
  try {
    // create post
    const postData = {
      user: req.user.id,
      photo: req.body.photo,
      caption: req.body.caption,
    };
    const post = new Post(postData);
    await post.save();

    // update profile
    const profile = await Profile.findOne({ user: req.user.id });
    profile.posts.push(post._id);
    await profile.save();

    const response = get_response_dict(200, 'Post created', post);
    return res.status(201).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// personalised feed
router.get('/feed', auth, async (req, res) => {
  try {
    const current_user = await User.findById(req.user.id);
    var posts = await Post.find({
      user: { $in: current_user.following },
    }).populate('user', 'username');

    var postsData = [];
    for (var i = 0; i < posts.length; i++) {
      var postData = posts[i].toJSON();
      if (posts[i].likes.includes(req.user.id)) {
        postData.isLiked = true;
      } else {
        postData.isLiked = false;
      }
      const profile = await Profile.findOne({ user: postData.user._id }).select(
        'pic'
      );
      postData.user.profile = profile;
      postsData.push(postData);
    }
    const response = get_response_dict(200, 'Posts fetched', postsData);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// delete post
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      const response = get_response_dict(404, 'Post not found', {});
      return res.status(404).json(response);
    }
    if (post.user.toString() !== req.user.id) {
      const response = get_response_dict(401, 'User not authorised', {});
      return res.status(401).json(response);
    }
    await post.remove();
    const response = get_response_dict(200, 'Post deleted', {});
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// like post
router.post('/togglelike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      const response = get_response_dict(404, 'Post not found', {});
      return res.status(404).json(response);
    }

    // check if post has already been liked
    if (post.likes.includes(req.user.id)) {
      // remove like
      post.likes.pull(req.user.id);
      await post.save();

      const response = get_response_dict(200, 'Post unliked', post);
      return res.status(200).json(response);
    } else {
      // add like
      post.likes.push(req.user.id);
      await post.save();

      const response = get_response_dict(200, 'Post liked', post);
      // create notification
      if (post.user.toString() !== req.user.id) {
        createNotification({
          receiver: post.user,
          sender: req.user.id,
          type: NotificationTypes.post,
          action: NotificationTypeActionMapping.post.like,
          item_id: post._id,
        });
      }
      return res.status(200).json(response);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// comment on post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      const response = get_response_dict(404, 'Post not found', {});
      return res.status(404).json(response);
    }
    const newComment = {
      post: req.params.id,
      user: req.user.id,
      text: req.body.text,
    };

    const comment = new Comment(newComment);
    await comment.save();

    // create notification
    if (post.user.toString() !== req.user.id) {
      createNotification({
        receiver: post.user,
        sender: req.user.id,
        type: NotificationTypes.post,
        action: NotificationTypeActionMapping.post.comment,
        item_id: post._id,
      });
    }
    const response = get_response_dict(200, 'Comment added', comment);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// delete a comment
router.delete('/comment/:comment_id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment) {
      const response = get_response_dict(404, 'Comment not found', {});
      return res.status(404).json(response);
    }

    // check user
    if (comment.user.toString() !== req.user.id) {
      const response = get_response_dict(401, 'User not authorised', {});
      return res.status(401).json(response);
    }

    // delete comment
    await comment.remove();

    const response = get_response_dict(200, 'Comment deleted', post);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// view a post
router.get('/post/:id', auth, async (req, res) => {
  try {
    var post = await Post.findById(req.params.id).populate('user', [
      'username',
    ]);
    if (!post) {
      const response = get_response_dict(404, 'Post not found', {});
      return res.status(404).json(response);
    }

    var postData = post.toJSON();
    // include user profile data
    const profile = await Profile.findOne({ user: post.user }).select('pic');

    var comments_list = [];
    const comments = await Comment.find({ post: post._id }).populate('user', [
      'username',
    ]);
    for (var i = 0; i < comments.length; i++) {
      var commentsData = comments[i].toJSON();
      const commentor_profile = await Profile.findOne({
        user: comments[i].user._id,
      }).select('pic');
      commentsData.user.profile = commentor_profile;
      comments_list.push(commentsData);
    }
    postData.user.profile = profile;
    postData.comments = comments_list;

    // check if post has already been liked
    if (post.likes.includes(req.user.id)) {
      postData.isLiked = true;
    } else {
      postData.isLiked = false;
    }

    const response = get_response_dict(200, 'Post fetched', postData);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// get all comments of a post
router.get('/post/:id/comments', auth, async (req, res) => {
  try {
    var post = await Post.findById(req.params.id);
    if (!post) {
      const response = get_response_dict(404, 'Post not found', {});
      return res.status(404).json(response);
    }

    var comments_list = [];
    const comments = await Comment.find({ post: post._id }).populate('user', [
      'username',
    ]);
    for (var i = 0; i < comments.length; i++) {
      var commentsData = comments[i].toJSON();
      const commentor_profile = await Profile.findOne({
        user: comments[i].user._id,
      }).select('pic');
      commentsData.user.profile = commentor_profile;
      comments_list.push(commentsData);
    }

    const response = get_response_dict(200, 'Comments fetched', comments_list);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




module.exports = router;

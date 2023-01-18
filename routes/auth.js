const express = require('express')
const { validateUser, validateLogin } = require('../utils/validateAuth');
const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require('bcrypt');
const get_response_dict = require('../utils/response');
const { response } = require('express');
const router = express.Router();

//login
router.post("/login", async (req,res)=>{
    // validate login
    const result = validateLogin(req.body);
    if(result.error){
        const response = get_response_dict(401, "Validation error", {error: result.error.details[0].message})
        return res.status(400).json(response);
    }
    // check if user exist
    try{
        const user = await User.findOne({username : req.body.username});
        if(!user) {
            const response = get_response_dict(401, "User not registered", null)
            return res.status(401).json(response);
        }
        // bcrypt compare password
        const isMatch = await bcrypt.compare( req.body.password, user.password)
        if(!isMatch){
            const response = get_response_dict(401, "Invalid credentials", null)
            return res.status(401).json(response);
        }
        // then return token
        const token = user.generateAuthToken()
        const response = get_response_dict(200, "Login successful", {token:token})
        return res.send(response);
    }catch(err){
        console.error(err.message);
        return res.status(400).send("Server Error");
    }
})

// register
router.post("/register", async (req,res) => {
    const result = validateUser(req.body);
    if(result.error){
        const response = get_response_dict(401, "Validation error", {error: result.error.details[0].message})
        return res.status(400).json(response);
    }
    try{
        //check if user already exists
        const check_user = await User.findOne({$or:[
            {username: req.body.username},
            {email: req.body.email}
        ]})
        if(check_user){
            const response = get_response_dict(401, "User already exists", null)
            return res.status(401).send(response);
        }
        // create object
        const newUser = {
            username : req.body.username,
            name : req.body.name,
            email : req.body.email,
            password: req.body.password,
        }
        const user = new User(newUser);

        //bcrypt hashing
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        //save
        await user.save();

        // init profile
        const initProfile = {
            user: user._id
        }
        const profile = new Profile(initProfile)
        await profile.save();
        //return jwt token
        const token = user.generateAuthToken();
        const response = get_response_dict(200, "User registration successful", {token:token})
        return res.send(response);
    } catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;
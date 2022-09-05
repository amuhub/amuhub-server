const express = require('express')
const { validateUser, validateLogin } = require('../utils/validateAuth');
const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require('bcrypt');
const router = express.Router();

//login
router.post("/login", async (req,res)=>{
    // validate login
    const result = validateLogin(req.body);
    if(result.error){
        return res.status(400).json({error: result.error.details[0].message});
    }
    // check if user exist
    try{
        const user = await User.findOne({username : req.body.username});
        if(!user) {
            return res.status(401).json({error : "User not registered"});
        }
        // bcrypt compare password
        const isMatch = await bcrypt.compare( req.body.password, user.password)
        if(!isMatch){
            return res.send(401).json({error:"Invalid credentials"})
        }
        // then return token
        const token = user.generateAuthToken()
        return res.send(token);
    }catch(err){
        console.error(err.message);
        return res.status(400).send("Server Error");
    }
})

// register
router.post("/register", async (req,res) => {
    const result = validateUser(req.body);
    if(result.error){
        return res.status(400).json({error: result.error.details[0].message});
    }
    try{
        //check if user already exists
        const check_user = await User.findOne({$or:[
            {username: req.body.username},
            {email: req.body.email}
        ]})
        if(check_user){
            return res.status(401).json({error: "User already exists"});
        }
        // create object
        const newUser = {
            username : req.body.username,
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
        return res.send(token);
    } catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;
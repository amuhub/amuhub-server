const express = require("express");
const Tags = require("../models/Tag");
const joi = require("joi");
const { auth, authAdmin } = require('../middleware/auth');
const router = express.Router();
const get_response_dict = require('../utils/response');


const validateTag = (tag) => {
    const schema = joi.object({
        name : joi.string().min(3).max(30).required()
    });

    return schema.validate(tag);
}

// get all tags
router.get("/", auth, async (req,res) => {
    try{
        const tags = await Tags.find();
        const response = get_response_dict(200, "Tags found", tags);
        return res.status(200).json(response);
    } catch(err){
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});

// create a tag (admin only)
router.post("/", authAdmin, async (req,res) => {
    const result = validateTag(req.body);
    if(result.error){
        const response = get_response_dict(401, "Validation error", {error: result.error.details[0].message})
        return res.status(400).json(response);
    }
    try{
        const tag = new Tags({name : req.body.name});
        await tag.save();
        const response = get_response_dict(201, "Tag created", tag);
        return res.status(201).json(response);
    } catch(err){
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});

// delete a tag (admin only)
router.delete("/:id", authAdmin, async (req,res) => {
    try{
        const tag = await Tags.findById(req.params.id);
        if(!tag){
            const response = get_response_dict(401, "Tag not found", null)
            return res.status(401).json(response);
        }
        await tag.remove();
        const response = get_response_dict(200, "Tag deleted", null);
        return res.status(200).json(response);
    }
    catch(err){
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});

module.exports = router;
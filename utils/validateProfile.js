const joi = require("joi");

const validateProfile = (profile) => {
    const schema = joi.object({
        bio: joi.string(),
        department: joi.string(),
        location: joi.string(),
        interest: joi.array(),
    })

    const result = schema.validate(profile);
    return result;
}


module.exports =  validateProfile;
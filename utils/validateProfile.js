const joi = require("joi");

const validateProfile = (profile) => {
    const schema = joi.object({
        bio: joi.string().allow(''),
        department: joi.string().allow(''),
        location: joi.string().allow(''),
        interest: joi.array(),
    })

    const result = schema.validate(profile);
    return result;
}


module.exports =  validateProfile;
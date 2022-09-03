import joi from 'joi';

const validateUser = (user : object) => {
    const schema = joi.object({
        username : joi.string().min(3).required(),
        email: joi.string().email().required(),
        password : joi.string().required(),
    })

    const result = schema.validate(user)
    return result
}

const validateLogin = (user : object) => {
    const schema = joi.object({
        username: joi.string().required(),
        password : joi.string().required()
    })

    const result = schema.validate(user);
    return result
}

export { validateUser, validateLogin };
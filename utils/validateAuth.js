const joi = require('joi');

const validateUser = (user) => {
  const schema = joi.object({
    username: joi.string().min(3).required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const result = schema.validate(user);
  return result;
};

const validateLogin = (user) => {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });

  const result = schema.validate(user);
  return result;
};

module.exports = { validateUser, validateLogin };

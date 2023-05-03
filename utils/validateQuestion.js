const joi = require('joi');

const validateQuestion = (question) => {
  const schema = joi.object({
    ques: joi.string().required(),
    tag: joi.string().required(),
  });

  const result = schema.validate(question);
  return result;
};

module.exports = validateQuestion;

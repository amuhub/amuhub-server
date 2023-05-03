const joi = require('joi');

const validateAnswer = (answer) => {
  const schema = joi.object({
    text: joi.string().required(),
    ques: joi.string().required(),
  });

  const result = schema.validate(answer);
  return result;
};

module.exports = validateAnswer;

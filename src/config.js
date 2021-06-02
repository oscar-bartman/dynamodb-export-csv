const Joi = require('joi')

const schema = Joi.object({
  AWS_REGION: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  EXPORT_BUCKET: Joi.string().required()
}).unknown(true)

module.exports = Joi.attempt(process.env, schema)

const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  version: joi.number().meta({ default: '1.0.0' }).description('Follows semantic versioning.'),
  group: joi.number().required(),
  type: joi.string().required(),
  o: joi.object(),
}).meta({
  name: 'Test Schema',
  filename: 'testSchema',
});

const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  version: joi.number().meta({ default: '1.0.0' }).description('Follows semantic versioning.'),
  group: joi.number().required(),
  type: joi.string().required(),
  childSchema: joi.object().keys({
    foo: joi.string(),
    bar: joi.string(),
  }).meta({
    name: 'Child Schema',
    filename: 'childSchema',
  }),
}).meta({
  name: 'Root Schema',
  filename: 'rootSchema',
});

const joi = require('@hapi/joi');

module.exports = joi
  .object()
  .keys({
    version: joi
      .number()
      .meta({ default: '1.0.0' })
      .description('Follows semantic versioning.'),
    group: joi.number().required(),
    type: joi.string().required(),
    level1Schema: joi
      .object()
      .keys({
        foo: joi.string(),
        bar: joi.string(),
        level2Schema: joi
          .object()
          .keys({
            baz: joi.string(),
          })
          .meta({
            name: 'Level 2 Schema',
            filename: 'level2Schema',
          }),
      })
      .meta({
        name: 'Level 1 Schema',
        filename: 'level1Schema',
      }),
  })
  .meta({
    name: 'Root Schema',
    filename: 'rootSchema',
  });

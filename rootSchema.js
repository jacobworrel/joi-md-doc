const joi = require('@hapi/joi');
const R = require('ramda');

const listItem = joi
  .object()
  .keys({
    quux: joi.string(),
  })
  .meta({
    name: 'List Item',
    filename: 'listItemSchema',
  });

module.exports = joi
  .object()
  .keys({
    version: joi
      .number()
      .meta({ default: '1.0.0' })
      .description('Follows semantic versioning.'),
    group: joi.number().required(),
    type: joi
      .string()
      .required()
      .valid(...R.map(R.pipe(R.toString, R.concat('valid')), R.range(0, 4)))
      .invalid(
        ...R.map(R.pipe(R.toString, R.concat('invalid')), R.range(0, 4)),
      ),
    primitiveList: joi.array().items(joi.string(), joi.number(), joi.boolean()),
    objectList: joi.array().items(listItem),
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

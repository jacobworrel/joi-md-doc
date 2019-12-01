const path = require('path');
const R = require('ramda');
const rootSchema = require('./rootSchema');
const { makeMarkdownDoc } = require('./../index');
const joi = require('@hapi/joi');

const pathTo = R.partial(path.join, [__dirname]);

console.log(JSON.stringify(rootSchema.describe(), null, 2));

// todo figure out how to get path to project root

const schema = joi
  .object()
  .keys({
    version: joi
      .number()
      .meta({ default: '1.0.0' })
      .description('Follows semantic versioning.'),
    any: joi.any(),
    primitiveList: joi
      .array()
      .items(joi.string(), joi.number(), joi.boolean())
      .min(1)
      .max(3),
  })
  .meta({ name: 'My Schema', filename: 'mySchema' });
makeMarkdownDoc(schema, { outputPath: pathTo('./doc') });

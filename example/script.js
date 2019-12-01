const path = require('path');
const R = require('ramda');
const rootSchema = require('./rootSchema');
const { makeMarkdownDoc } = require('./../index');

const pathTo = R.partial(path.join, [__dirname]);

console.log(JSON.stringify(rootSchema.describe(), null, 2));

// todo figure out how to get path to project root
makeMarkdownDoc(rootSchema, { outputPath: pathTo('./doc') });

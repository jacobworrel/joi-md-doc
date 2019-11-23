const fs = require('fs');
const makeMarkdownByFilename = require('./src/makeMarkdownByFilename');
const path = require('path');
const R = require('ramda');
const rootSchema = require('./rootSchema');
const { promisify } = require('util');

const pathTo = R.partial(path.join, [__dirname]);
const writeFileAsync = promisify(fs.writeFile);

console.log(rootSchema.describe());

R.pipe(
  makeMarkdownByFilename,
  R.forEachObjIndexed((markdown, filename) =>
    writeFileAsync(pathTo(`./dist/${filename}.md`), markdown, 'utf-8'),
  ),
)(rootSchema);

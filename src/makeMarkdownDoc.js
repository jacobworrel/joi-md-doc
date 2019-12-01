const fs = require('fs');
const makeMarkdownByFilename = require('./makeMarkdownByFilename');
const R = require('ramda');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

// todo mkdir './dist' if no dir exists
const defaultConfig = {
  outputPath: './dist',
};

const makeMarkdownDoc = (schema, { outputPath } = defaultConfig) =>
  R.pipe(
    makeMarkdownByFilename,
    R.forEachObjIndexed((markdown, filename) =>
      writeFileAsync(`${outputPath}/${filename}.md`, markdown, 'utf-8'),
    ),
  )(schema);

module.exports = makeMarkdownDoc;

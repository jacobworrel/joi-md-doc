const fs = require('fs');
const makeMarkdownByFilename = require('./makeMarkdownByFilename');
const mkdirp = require('mkdirp');
const R = require('ramda');
const { promisify } = require('util');
const path = require('path');

const writeFileAsync = promisify(fs.writeFile);

const defaultDir = '/doc';

async function makeMarkdownDoc(schema, { outputPath } = {}) {
  return R.pipe(
    R.when(
      R.always(R.isNil(outputPath)),
      R.tap(async () => {
        outputPath = path.parse(require.main.filename).dir + defaultDir;
        await mkdirp(outputPath);
      }),
    ),
    makeMarkdownByFilename,
    R.forEachObjIndexed((markdown, filename) => {
      const path = `${outputPath}/${filename}.md`;
      writeFileAsync(path, markdown, 'utf-8');
      console.log(`Writing file ${path}...`);
    }),
  )(schema);
}

module.exports = makeMarkdownDoc;

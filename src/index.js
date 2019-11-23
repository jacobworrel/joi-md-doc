const fs = require('fs');
const json2md = require('json2md');
const ju = require('./joiUtil');
const mdu = require('./markdownUtil');
const path = require('path');
const R = require('ramda');
const rootSchema = require('./../rootSchema');
const { promisify } = require('util');

const pathTo = R.partial(path.join, [__dirname]);
const writeFileAsync = promisify(fs.writeFile);

function makeMarkdownByFilename(rootSchema) {
  const markdownByFilename = {};

  function makeMarkdownWith(schema, path = []) {
    const name = ju.findMeta('name')(schema);
    const filename = ju.findMeta('filename')(schema);

    const json = R.pipe(
      R.prop('keys'),
      R.mapObjIndexed((val, key) => {
        if (ju.isPrimitive(val)) {
          return ju.makePrimitiveField(val, key);
        } else {
          makeMarkdownWith(val, R.append(filename, path));
          return ju.makeObjectField(val, key);
        }
      }),
      R.values,
      R.prepend(mdu.makeSchemaTitle(name)),
      R.when(
        () => R.not(R.isEmpty(path)),
        R.prepend(mdu.makeFilePathLink(path)),
      ),
    )(schema);

    markdownByFilename[filename] = json2md(json);
  }

  makeMarkdownWith(rootSchema.describe());

  return markdownByFilename;
}

const markdownByFilename = makeMarkdownByFilename(rootSchema);

R.forEachObjIndexed((markdown, filename) =>
  writeFileAsync(pathTo(`./../dist/${filename}.md`), markdown, 'utf-8'),
)(markdownByFilename);

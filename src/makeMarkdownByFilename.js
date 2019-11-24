const json2md = require('json2md');
const ju = require('./joiUtil');
const mdu = require('./markdownUtil');
const R = require('ramda');

function makeMarkdownByFilename(rootSchema) {
  const markdownByFilename = {};

  const makeMarkdownWith = R.curry((path, schema) => {
    const name = ju.findMeta('name')(schema);
    const filename = ju.findMeta('filename')(schema);
    const nextPath = R.append({ name, filename }, path);

    const json = R.pipe(
      R.prop('keys'),
      R.mapObjIndexed((val, key) =>
        R.cond([
          [ju.isPrimitive, ju.makePrimitiveField(key)],
          [
            ju.isObject,
            R.pipe(R.tap(makeMarkdownWith(nextPath)), ju.makeObjectField(key)),
          ],
          [
            ju.isArray,
            R.pipe(
              R.tap(
                R.pipe(
                  R.propOr([], 'items'),
                  R.forEach(R.when(ju.isObject, makeMarkdownWith(nextPath))),
                ),
              ),
              ju.makeArrayField(key),
            ),
          ],
          [R.T, R.identity],
        ])(val),
      ),
      R.values,
      R.prepend(mdu.makeSchemaTitle(name)),
      R.when(
        () => R.not(R.isEmpty(path)),
        R.prepend(mdu.makeFilePathLink(path)),
      ),
    )(schema);

    markdownByFilename[filename] = json2md(json);
  });

  makeMarkdownWith([], rootSchema.describe());

  return markdownByFilename;
}

module.exports = makeMarkdownByFilename;

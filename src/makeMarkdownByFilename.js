const json2md = require('json2md');
const ju = require('./joiUtil');
const mdu = require('./markdownUtil');
const R = require('ramda');

function makeMarkdownByFilename(rootSchema) {
  const markdownByFilename = {};

  const makeMarkdownWith = R.curry((path, schema) => {
    let json;
    const filename = R.pipe(
      ju.findMeta('filename'),
      ju.throwWhenNil('Required filename meta tag not provided.'),
    )(schema);

    const name = R.pipe(ju.findMeta('name'), R.defaultTo(filename))(schema);
    const nextPath = R.append({ name, filename }, path);
    const isRootArray = R.pipe(ju.isArray)(schema);
    // if (isRootArray) {
    json = R.pipe(
      R.when(ju.isArray, R.pipe(R.prop('items'), R.prop(0))),
      R.prop('keys'),
      R.reject(R.pipe(ju.findMeta('isDocumented'), R.equals(false))),
      R.mapObjIndexed((val, key) =>
        R.pipe(
          // temporary hack until i figure out a proper way to handle alternatives type
          R.when(ju.isAlternative, R.path(['matches', 0, 'then'])),
          R.cond([
            [ju.isPrimitive, ju.makePrimitiveField(key)],
            [
              ju.isObject,
              R.pipe(
                R.tap(makeMarkdownWith(nextPath)),
                ju.makeObjectField(key),
              ),
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
          ]),
        )(val),
      ),
      R.values,
      R.when(() => isRootArray, R.prepend(ju.makeArrayFieldFromRoot(schema))),
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

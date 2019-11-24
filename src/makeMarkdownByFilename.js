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
      R.mapObjIndexed((val, key) => {
        if (ju.isPrimitive(val)) {
          return ju.makePrimitiveField(val, key);
        } else if (ju.isObject(val)) {
          makeMarkdownWith(nextPath, val);
          return ju.makeObjectField(val, key);
        } else if (ju.isArray(val)) {
          const {
            type,
            items,
            flags: { presence = 'optional', description = '' } = {},
          } = val;
          const typeList = R.pipe(
            R.map(
              R.ifElse(
                ju.isPrimitive,
                R.pipe(R.prop('type'), mdu.wrapInBackticks),
                R.pipe(R.tap(makeMarkdownWith(nextPath)), x =>
                  mdu.makeLink({
                    name: ju.findMeta('name')(x),
                    filename: ju.findMeta('filename')(x),
                  }),
                ),
              ),
            ),
          )(items);
          const isRequired = R.equals(presence, 'required');
          return [
            mdu.makeKeyTitle(key),
            ju.makeTypeDef([
              `${ju.makeType(type)}: ${typeList}`,
              ju.makeRequiredOrOptional(isRequired),
            ]),
            mdu.makeDescription(description),
          ];
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
  });

  makeMarkdownWith([], rootSchema.describe());

  return markdownByFilename;
}

module.exports = makeMarkdownByFilename;

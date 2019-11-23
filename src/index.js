const json2md = require('json2md');
const R = require('ramda');
const rootSchema = require('./../rootSchema');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mdu = require('./markdownUtil');

const pathTo = R.partial(path.join, [__dirname]);
const writeFileAsync = promisify(fs.writeFile);

const primitiveList = ['string', 'number', 'boolean'];

const findMeta = x =>
  R.pipe(
    R.prop('metas'),
    R.defaultTo([]),
    R.find(R.has(x)),
    R.defaultTo({}),
    R.prop(x),
  );

const makeTypeDef = R.pipe(
  R.reject(R.either(R.isEmpty, R.isNil)),
  R.join(' | '),
  R.objOf('blockquote'),
);
const makeType = x => mdu.wrapInBackticks(x);
const makeRequiredOrOptional = isRequired =>
  `${isRequired ? 'Required' : 'Optional'}`;
const makeDefault = R.when(
  R.complement(R.isNil),
  R.pipe(mdu.wrapInBackticks, R.concat('Default: ')),
);

const isPrimitive = R.pipe(R.prop('type'), R.includes(R.__, primitiveList));

// PRIMITIVE TYPES
const makePrimitiveTitle = x => mdu.makeKeyTitle(x);
const makePrimitiveField = (val, key) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  const defaultVal = findMeta('default')(val);
  return [
    makePrimitiveTitle(key),
    makeTypeDef([
      makeType(type),
      makeRequiredOrOptional(isRequired),
      makeDefault(defaultVal),
    ]),
    mdu.makeDescription(description),
  ];
};

// OBJECT TYPES
const makeObjectTitle = R.pipe(
  key => `[${key}](./${key}.md)`,
  mdu.makeKeyTitle,
);
const makeObjectField = (val, key) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  return [
    makeObjectTitle(key),
    makeTypeDef([makeType(type), makeRequiredOrOptional(isRequired)]),
    mdu.makeDescription(description),
  ];
};

function makeMarkdownByFilename(root) {
  const markdownByFilename = {};

  function makeMarkdownWith(schema, path = []) {
    const name = findMeta('name')(schema);
    const filename = findMeta('filename')(schema);

    const json = R.pipe(
      R.prop('keys'),
      R.mapObjIndexed((val, key) => {
        if (isPrimitive(val)) {
          return makePrimitiveField(val, key);
        } else {
          makeMarkdownWith(val, R.append(filename, path));
          return makeObjectField(val, key);
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

  makeMarkdownWith(root);

  return markdownByFilename;
}

const root = rootSchema.describe();
const markdownByFilename = makeMarkdownByFilename(root);

R.forEachObjIndexed((markdown, filename) =>
  writeFileAsync(pathTo(`./../dist/${filename}.md`), markdown, 'utf-8'),
)(markdownByFilename);

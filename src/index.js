const json2md = require('json2md');
const R = require('ramda');
const rootSchema = require('./../rootSchema');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const pathTo = R.partial(path.join, [__dirname]);
const writeFileAsync = promisify(fs.writeFile);

const primitiveList = ['string', 'number', 'boolean'];

const findMeta = x => R.pipe(
  R.prop('metas'),
  R.defaultTo([]),
  R.find(R.has(x)),
  R.defaultTo({}),
  R.prop(x)
);

const makeSchemaTitle = R.objOf('h1');
const makeKeyTitle = R.objOf('h2');
const makeDescription = R.objOf('p');
const wrapInBackticks = x => `\`${x}\``;

const makeTypeDef = R.pipe(
  R.reject(R.either(R.isEmpty, R.isNil)),
  R.join(' | '),
  R.objOf('blockquote')
);
const makeType = x => wrapInBackticks(x);
const makeRequiredOrOptional = isRequired => `${isRequired ? 'Required' : 'Optional'}`;
const makeDefault = R.when(
  R.complement(R.isNil),
  R.pipe(
    wrapInBackticks,
    R.concat('Default: ')
  )
);
const makeParentFilenameLink = parentFilename => `[Back to Parent Schema](./${parentFilename}.md)`;

const isPrimitive = R.pipe(
  R.prop('type'),
  R.includes(R.__, primitiveList)
);

// PRIMITIVE TYPES
const makePrimitiveTitle = x => makeKeyTitle(x);
const makePrimitiveField = (val, key) => {
  const {
    type,
    flags: {
      presence = 'optional',
      description = '',
    } = {},
  } = val;
  const isRequired = R.equals(presence, 'required');
  const defaultVal = findMeta('default')(val);
  return [
    makePrimitiveTitle(key),
    makeTypeDef([
      makeType(type),
      makeRequiredOrOptional(isRequired),
      makeDefault(defaultVal),
    ]),
    makeDescription(description),
  ]
};

// OBJECT TYPES
const makeObjectTitle = R.pipe(
  key => `[${key}](./${key}.md)`,
  makeKeyTitle
);
const makeObjectField = (val, key) => {
  const {
    type,
    flags: {
      presence = 'optional',
      description = '',
    } = {},
  } = val;
  const isRequired = R.equals(presence, 'required');
  return [
    makeObjectTitle(key),
    makeTypeDef([
      makeType(type),
      makeRequiredOrOptional(isRequired),
    ]),
    makeDescription(description),
  ]
};

function parseSchema (schema, parentFilename) {
  const name = findMeta('name')(schema);
  const filename = findMeta('filename')(schema);

  const json = R.pipe(
    R.prop('keys'),
    R.mapObjIndexed((val, key) => {
      if (isPrimitive(val)) {
        return makePrimitiveField(val, key);
      }
      else {
        parseSchema(val, filename);
        return makeObjectField(val, key)
      }
    }),
    R.values,
    R.prepend(makeSchemaTitle(name)),
    R.when(
      () => R.not(R.isNil(parentFilename)),
      R.prepend(makeParentFilenameLink(parentFilename))
    )
  )(schema);

  const markdown = json2md(json);
  writeFileAsync(pathTo(`./../dist/${filename}.md`), markdown, 'utf-8');
}

const root = rootSchema.describe();
parseSchema(root);
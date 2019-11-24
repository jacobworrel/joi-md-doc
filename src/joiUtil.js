const R = require('ramda');
const mdu = require('./markdownUtil');
const primitiveList = ['string', 'number', 'boolean'];

const ju = {};

ju.findMeta = x =>
  R.pipe(
    R.prop('metas'),
    R.defaultTo([]),
    R.find(R.has(x)),
    R.defaultTo({}),
    R.prop(x),
  );

ju.makeTypeDef = R.pipe(
  R.reject(R.either(R.isEmpty, R.isNil)),
  R.join(' | '),
  R.objOf('blockquote'),
);
ju.makeType = x => mdu.wrapInBackticks(x);
ju.makeRequiredOrOptional = isRequired =>
  `${isRequired ? 'Required' : 'Optional'}`;
ju.makeDefault = R.when(
  R.complement(R.isNil),
  R.pipe(mdu.wrapInBackticks, R.concat('Default: ')),
);

ju.isPrimitive = R.pipe(R.prop('type'), R.includes(R.__, primitiveList));
ju.isObject = R.pipe(R.prop('type'), R.equals('object'));
ju.isArray = R.pipe(R.prop('type'), R.equals('array'));

// PRIMITIVE TYPES
ju.makePrimitiveField = R.curry((key, val) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  const defaultVal = ju.findMeta('default')(val);
  return [
    mdu.makeKeyTitle(key),
    ju.makeTypeDef([
      ju.makeType(type),
      ju.makeRequiredOrOptional(isRequired),
      ju.makeDefault(defaultVal),
    ]),
    mdu.makeDescription(description),
  ];
});

// OBJECT TYPES
ju.makeObjectField = R.curry((key, val) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  const filename = ju.findMeta('filename')(val);
  return [
    R.pipe(mdu.makeLink, mdu.makeKeyTitle)({ name: key, filename }),
    ju.makeTypeDef([ju.makeType(type), ju.makeRequiredOrOptional(isRequired)]),
    mdu.makeDescription(description),
  ];
});

// ARRAY TYPES
ju.makeArrayField = R.curry((key, val) => {
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
        R.pipe(x =>
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
});

module.exports = ju;

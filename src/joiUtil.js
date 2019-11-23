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
(ju.makeType = x => mdu.wrapInBackticks(x)),
  (ju.makeRequiredOrOptional = isRequired =>
    `${isRequired ? 'Required' : 'Optional'}`);
ju.makeDefault = R.when(
  R.complement(R.isNil),
  R.pipe(mdu.wrapInBackticks, R.concat('Default: ')),
);

ju.isPrimitive = R.pipe(R.prop('type'), R.includes(R.__, primitiveList));

// PRIMITIVE TYPES
ju.makePrimitiveTitle = x => mdu.makeKeyTitle(x);
ju.makePrimitiveField = (val, key) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  const defaultVal = ju.findMeta('default')(val);
  return [
    ju.makePrimitiveTitle(key),
    ju.makeTypeDef([
      ju.makeType(type),
      ju.makeRequiredOrOptional(isRequired),
      ju.makeDefault(defaultVal),
    ]),
    mdu.makeDescription(description),
  ];
};

// OBJECT TYPES
ju.makeObjectTitle = R.pipe(key => `[${key}](./${key}.md)`, mdu.makeKeyTitle);
ju.makeObjectField = (val, key) => {
  const { type, flags: { presence = 'optional', description = '' } = {} } = val;
  const isRequired = R.equals(presence, 'required');
  return [
    ju.makeObjectTitle(key),
    ju.makeTypeDef([ju.makeType(type), ju.makeRequiredOrOptional(isRequired)]),
    mdu.makeDescription(description),
  ];
};

module.exports = ju;

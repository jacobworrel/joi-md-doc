const R = require('ramda');
const mdu = require('./markdownUtil');
const primitiveList = ['string', 'number', 'boolean'];

const maxValueListLength = 5;

const ju = {};

ju.throwWhenNil = msg =>
  R.when(
    R.isNil,
    R.tap(() => {
      throw new Error(msg);
    }),
  );

ju.findMeta = x =>
  R.pipe(
    R.prop('metas'),
    R.defaultTo([]),
    R.find(R.has(x)),
    R.defaultTo({}),
    R.prop(x),
  );

ju.findRule = x =>
  R.pipe(
    R.prop('rules'),
    R.defaultTo([]),
    R.find(R.propEq('name', x)),
    R.defaultTo({}),
  );

ju.makeLimit = x =>
  R.pipe(
    R.pipe(ju.findRule(x), R.path(['args', 'limit'])),
    R.ifElse(
      R.isNil,
      R.always(''),
      R.pipe(mdu.wrapInBackticks, R.concat(`${x}: `)),
    ),
  );

ju.makeTypeDef = R.pipe(
  R.reject(R.either(R.isEmpty, R.isNil)),
  R.join(' | '),
  R.objOf('blockquote'),
);
ju.makeType = R.pipe(R.prop('type'), mdu.wrapInBackticks);
ju.makeRequiredOrOptional = R.pipe(
  R.path(['flags', 'presence']),
  R.ifElse(R.equals('required'), R.always('Required'), R.always('Optional')),
);
ju.makeDefault = R.pipe(
  ju.findMeta('default'),
  R.when(
    R.complement(R.isNil),
    R.pipe(mdu.wrapInBackticks, R.concat('Default: ')),
  ),
);

ju.isPrimitive = R.pipe(R.prop('type'), R.includes(R.__, primitiveList));
ju.isObject = R.pipe(R.prop('type'), R.equals('object'));
ju.isArray = R.pipe(R.prop('type'), R.equals('array'));

ju.shouldHaveValueList = R.both(
  R.pipe(R.length, R.lte(R.__, maxValueListLength)),
  R.complement(R.isEmpty),
);
ju.makeValueList = R.pipe(R.map(mdu.wrapInBackticks), R.join(', '));

// PRIMITIVE TYPES
ju.makePrimitiveField = R.curry((key, val) => {
  const { allow = [], invalid = [], flags: { description = '' } = {} } = val;
  return R.pipe(
    R.when(
      () => ju.shouldHaveValueList(allow),
      R.append(mdu.makeParagraph(`Whitelist: ${ju.makeValueList(allow)}`)),
    ),
    R.when(
      () => ju.shouldHaveValueList(invalid),
      R.append(mdu.makeParagraph(`Blacklist: ${ju.makeValueList(invalid)}`)),
    ),
  )([
    mdu.makeKeyTitle(key),
    ju.makeTypeDef([
      ju.makeType(val),
      ju.makeRequiredOrOptional(val),
      ju.makeDefault(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
    ]),
    mdu.makeParagraph(description),
  ]);
});

// OBJECT TYPES
ju.makeObjectField = R.curry((key, val) => {
  const { flags: { description = '' } = {} } = val;
  const filename = ju.findMeta('filename')(val);
  return [
    R.pipe(mdu.makeLink, mdu.makeKeyTitle)({ name: key, filename }),
    ju.makeTypeDef([
      ju.makeType(val),
      ju.makeRequiredOrOptional(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
    ]),
    mdu.makeParagraph(description),
  ];
});

// ARRAY TYPES
ju.makeArrayField = R.curry((key, val) => {
  const { items, flags: { description = '' } = {} } = val;

  const typeList = R.pipe(
    R.map(
      R.ifElse(
        ju.isPrimitive,
        ju.makeType,
        R.pipe(x =>
          mdu.makeLink({
            name: ju.findMeta('name')(x),
            filename: ju.findMeta('filename')(x),
          }),
        ),
      ),
    ),
  )(items);
  return [
    mdu.makeKeyTitle(key),
    ju.makeTypeDef([
      `${ju.makeType(val)}: ${typeList}`,
      ju.makeRequiredOrOptional(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
    ]),
    mdu.makeParagraph(description),
  ];
});

module.exports = ju;

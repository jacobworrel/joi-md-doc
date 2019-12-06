const R = require('ramda');
const mdu = require('./markdownUtil');
const primitiveList = ['string', 'number', 'boolean', 'any'];

const ju = {};

ju.maxValueListLength = 5;

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
ju.makeType = R.pipe(
  R.prop('type'),
  R.when(R.equals('any'), R.always('*')),
  mdu.wrapInBackticks,
);
ju.makeRequiredOrOptional = R.pipe(
  R.path(['flags', 'presence']),
  R.ifElse(R.equals('required'), R.always('required'), R.always('optional')),
);
ju.makeDefault = R.pipe(
  ju.findMeta('default'),
  R.when(
    R.complement(R.isNil),
    R.pipe(mdu.wrapInBackticks, R.concat('defaults to ')),
  ),
);
ju.makeDescription = R.pipe(
  R.path(['flags', 'description']),
  R.defaultTo([]),
  R.when(R.complement(R.isEmpty), R.pipe(mdu.makeParagraph, R.of)),
);

ju.isPrimitive = R.pipe(R.prop('type'), R.includes(R.__, primitiveList));
ju.isObject = R.pipe(R.prop('type'), R.equals('object'));
ju.isArray = R.pipe(R.prop('type'), R.equals('array'));
ju.isAlternative = R.pipe(R.prop('type'), R.equals('alternatives'));

ju.makeValueList = R.pipe(R.map(mdu.wrapInBackticks), R.join(', '));
ju.makeRestrictionWith = R.curry((label, source) =>
  R.pipe(
    R.prop(source),
    R.defaultTo([]),
    R.ifElse(
      R.both(
        R.pipe(R.length, R.lte(R.__, ju.maxValueListLength)),
        R.complement(R.isEmpty),
      ),
      R.pipe(ju.makeValueList, R.concat(`${label}: `), mdu.makeParagraph, R.of),
      R.always([]),
    ),
  ),
);

// PRIMITIVE TYPES
ju.makePrimitiveField = R.curry((key, val) => {
  return R.pipe(
    R.concat(R.__, ju.makeDescription(val)),
    R.concat(R.__, ju.makeRestrictionWith('whitelist', 'allow')(val)),
    R.concat(R.__, ju.makeRestrictionWith('blacklist', 'invalid')(val)),
  )([
    mdu.makeKeyTitle(key),
    ju.makeTypeDef([
      ju.makeType(val),
      ju.makeRequiredOrOptional(val),
      ju.makeDefault(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
      ju.makeLimit('length')(val),
    ]),
  ]);
});

// OBJECT TYPES
ju.makeObjectField = R.curry((key, val) => {
  const filename = ju.findMeta('filename')(val);
  return R.pipe(R.concat(R.__, ju.makeDescription(val)))([
    R.pipe(mdu.makeLink, mdu.makeKeyTitle)({ name: key, filename }),
    ju.makeTypeDef([
      ju.makeType(val),
      ju.makeRequiredOrOptional(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
      ju.makeLimit('length')(val),
    ]),
  ]);
});

ju.makeTypeArrayItems = R.pipe(
  R.prop('items'),
  R.defaultTo([]),
  R.map(
    R.ifElse(
      ju.isPrimitive,
      ju.makeType,
      R.pipe(x => {
        const filename = ju.findMeta('filename')(x);
        return mdu.makeLink({
          name: R.defaultTo(filename, ju.findMeta('name')(x)),
          filename,
        });
      }),
    ),
  ),
  R.join(', '),
  R.when(R.complement(R.isEmpty), R.concat(': ')),
);

// ARRAY TYPES
ju.makeTypeArray = val => `${ju.makeType(val)}${ju.makeTypeArrayItems(val)}`;
ju.makeArrayField = R.curry((key, val) => {
  return R.pipe(R.concat(R.__, ju.makeDescription(val)))([
    mdu.makeKeyTitle(key),
    ju.makeTypeDef([
      ju.makeTypeArray(val),
      ju.makeRequiredOrOptional(val),
      ju.makeLimit('min')(val),
      ju.makeLimit('max')(val),
      ju.makeLimit('length')(val),
    ]),
  ]);
});

module.exports = ju;

const json2md = require('json2md');
const R = require('ramda');
const testSchema = require('./../testSchema');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const pathTo = R.partial(path.join, [__dirname]);
const writeFileAsync = promisify(fs.writeFile);

const primitiveList = ['string', 'number', 'boolean'];

const schema = testSchema.describe();
const findMeta = x => R.pipe(
  R.prop('metas'),
  R.defaultTo([]),
  R.find(R.has(x)),
  R.defaultTo({}),
  R.prop(x)
);
const name = findMeta('name')(schema);
const filename = findMeta('filename')(schema);

const makeSchemaTitle = R.objOf('h1');
const makeKeyTitle = R.objOf('h2');
const makeBlockquote = R.objOf('blockquote');
const wrapInBackticks = x => `\`${x}\``;

const primitives = R.pipe(
  R.prop('keys'),
  R.filter(
    R.pipe(
      R.prop('type'),
      R.includes(R.__, primitiveList)
    )
  ),
  R.mapObjIndexed((val, key) => {
    const {
      type,
      flags: {
        presence = 'optional',
        description = '',
      },
    } = val;
    const isRequired = R.equals(presence, 'required');
    const defaultVal = findMeta('default')(val);
    return [
      makeKeyTitle(key),
      makeBlockquote(
        R.pipe(
          R.reject(R.either(R.isEmpty, R.isNil)),
          R.join(' | '),
        )([
          wrapInBackticks(type),
          `${isRequired ? 'required' : 'optional'}`,
          R.when(
            R.complement(R.isNil),
            R.pipe(
              wrapInBackticks,
              R.concat('defaults to ')
            )
          )(defaultVal),
          description,
        ])
      )
    ]
  }),
  R.values,
)(schema);

const md = json2md([
  makeSchemaTitle(name),
  ...primitives
]);

writeFileAsync(pathTo(`./../dist/${filename}.md`), md, 'utf-8');
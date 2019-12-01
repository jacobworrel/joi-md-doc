# joi-doc-gen

Generate markdown documentation files from @hapi/joi schemas.

## Installation and Usage

```javascript
const joi = require('@hapi/joi');
const { makeMarkdownDoc } = require('joi-doc-gen');

const schema = joi
  .object()
  .keys({
    version: joi
      .number()
      .meta({ default: '1.0.0' })
      .description('Follows semantic versioning.'),
    any: joi.any(),
    primitiveList: joi
      .array()
      .items(joi.string(), joi.number(), joi.boolean())
      .min(1)
      .max(3),
  })
  .meta({ name: 'My Schema', filename: 'mySchema' });

makeMarkdownDoc(schema);
```

# My Schema

## version

> `number` | optional | defaults to `1.0.0`


Follows semantic versioning.

## any

> `*` | optional

## primitiveList

> `array`: `string`, `number`, `boolean` | optional | min: `1` | max: `3`
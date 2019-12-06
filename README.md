# joi-md-doc

Generate markdown documentation files from [@hapi/joi](https://github.com/hapijs/joi) schemas.

## Installation

```markdown
npm i --save-dev joi-md-doc
```

## Usage

```javascript
const joi = require('@hapi/joi');
const { makeMarkdownDoc } = require('joi-md-doc');

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

## API

### makeMarkdownDoc(joiSchema[, options])

### makeMarkdownByFilename(joiSchema)

## Example

Check out the [example joi schema](./example/rootSchema.js) and [generated markdown](./example/doc/rootSchema.md) for currently supported joi validations.
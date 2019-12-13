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

const options = {
  outputPath: './doc',
};
makeMarkdownDoc(schema, options);
```

This package relies on joi's [description](https://hapi.dev/family/joi/?v=16.1.8#anydescriptiondesc) and [meta](https://hapi.dev/family/joi/?v=16.1.8#anymetameta) methods to generate formatted markdown documentation files, so you'll need to annotate your joi schemas with descriptions and [custom meta tags](#custom-meta-tags) to take full advantage of the API.

## API

### makeMarkdownDoc(joiSchema[, options])
`JoiSchema → undefined`

Traverses a root joi object schema and generates a markdown documentation file of every nested object schema in the tree.

#### options

##### outputPath
> `string` | optional | defaults to `./doc/`

The path to the directory where the markdown files get written to.

### makeMarkdownByFilename(joiSchema)
`JoiSchema → {String: String}`

### Custom Meta Tags

#### filename
> `string` | required

The filename of each generated markdown file. Required for each joi object schema. 

```javascript
const schema = joi.object().keys({
  foo: joi.string(),
}).meta({ filename: 'exampleSchema' });
```

#### name
> `string` | optional | defaults to value of `filename`

The name/title of the markdown file.

```javascript
const schema = joi.object().keys({
  foo: joi.string(),
}).meta({ name: 'Example Schema', filename: 'exampleSchema' });
```

#### default
> `*` | optional

The default value.

```javascript
const schema = joi.object().keys({
  version: joi.number().meta({ default: '1.0.0' }),
}).meta({ filename: 'exampleSchema '});
```

#### isDocumented
> `boolean` | optional | defaults to `true`

Flag that determines whether or not a key is documented.

```javascript
const schema = joi.object().keys({
  includedInDoc: joi.boolean(),
  excludedFromDoc: joi.boolean().meta({ isDocumented: false }),
}).meta({ filename: 'exampleSchema' });
```

## Example

Check out the [example joi schema](./example/rootSchema.js) and [generated markdown](./example/doc/rootSchema.md) for currently supported joi validations.
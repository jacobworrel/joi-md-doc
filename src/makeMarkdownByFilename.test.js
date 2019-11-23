const makeMarkdownByFilename = require('./makeMarkdownByFilename');
const rootSchema = require('./../rootSchema');

describe(`makeMarkdownByFilename`, () => {
  describe(`unit`, () => {
    it(`should support primitive type`, () => {
      const joiSchema = {
        describe: () => ({
          metas: [{ name: 'Test', filename: 'test' }],
          keys: {
            foo: { type: 'number' },
            bar: { type: 'string' },
            baz: { type: 'boolean' },
          },
        }),
      };

      expect(makeMarkdownByFilename(joiSchema)).toMatchSnapshot();
    });
  });

  describe(`integration`, () => {
    it(`should match snapshot`, () => {
      expect(makeMarkdownByFilename(rootSchema)).toMatchSnapshot();
    });
  });
});

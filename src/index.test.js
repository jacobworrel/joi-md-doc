const makeMarkdownByFilename = require('./index');
const rootSchema = require('./../rootSchema');

describe(`makeMarkdownByFilename`, () => {
  it(`should match snapshot`, () => {
    expect(makeMarkdownByFilename(rootSchema)).toMatchSnapshot();
  });
});

const makeMarkdownByFilename = require('./makeMarkdownByFilename');
const rootSchema = require('./../rootSchema');

describe(`makeMarkdownByFilename`, () => {
  it(`should match snapshot`, () => {
    expect(makeMarkdownByFilename(rootSchema)).toMatchSnapshot();
  });
});

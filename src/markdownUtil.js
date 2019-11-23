const R = require('ramda');

module.exports = {
  makeDescription: R.objOf('p'),
  makeFilePathLink: R.pipe(
    R.map(filename => `[${filename}](./${filename}.md)`),
    R.join(' / '),
  ),
  makeKeyTitle: R.objOf('h2'),
  makeSchemaTitle: R.objOf('h1'),
  wrapInBackticks: x => `\`${x}\``,
};

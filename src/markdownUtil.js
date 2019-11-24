const R = require('ramda');

const mu = {};

mu.makeDescription = R.objOf('p');
mu.makeLink = ({ name, filename }) => `[${name}](./${filename}.md)`;
mu.makeFilePathLink = R.pipe(R.map(mu.makeLink), R.join(' / '));
mu.makeKeyTitle = R.objOf('h2');
mu.makeSchemaTitle = R.objOf('h1');
mu.wrapInBackticks = x => `\`${x}\``;

module.exports = mu;

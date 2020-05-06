// Description
//   relbemp - relation bempie
//   relbemp = crebemp + linbemp
// Usage:
//   relbemp block element where_link
//   relbemp block where_link

const { exec } = require('child_process'), path = require('path');
const argv = process.argv.slice(2);

const crebemp = path.resolve(__dirname, 'crebemp.js') + ' ';
const linbemp = path.resolve(__dirname, 'linbemp.js') + ' ';

if (argv.length == 0 || argv.some(arg => arg.match(/(--help|\/\?)/))) {
  help();
  process.exit();
}

main();

function main() {
  let linkParamsIndexes = [
    argv.findIndex(arg => arg.match(/^-pug/)),
    argv.findIndex(arg => arg.match(/^-sass/)),
    argv.findIndex(arg => arg.match(/^-js/)),
    argv.findIndex(arg => arg.match(/^-end/))
  ];
  linkParamsIndexes = linkParamsIndexes.filter(i => i >= 0);
  linkParamsIndexes.forEach(i => argv.splice(i, 1));

  const linkParams = linkParamsIndexes.map(i => argv[i]).join(' ');

  console.log('hello');

  let link;

  switch (argv.length) {
    case 0:
      console.log('Error: No arguments given to relbemp.');
      break;

    case 1:
      exec(crebemp + argv[0]);
      break;

    case 2:
      link = `${argv[0]} ${argv[1]} ${linkParams}`;
      exec(crebemp + argv[0]);
      exec(linbemp + link);
      break;

    case 3:
      const element = `${argv[0]} ${argv[1]}`;
      link = `${argv[0]}/${argv[1]} ${argv[2]} ${linkParams}`;
      exec(crebemp + element);
      exec(linbemp + link);
      break;

    default: console.log('Error: Given to much args to relbemp.');
  }
}

function help() {
  let help = `
    > relbemp block_name 
        ^=> crebemp block_name
    > relbemp block_name where_link 
        ^=> crebemp block_name && linbemp block_name where_link
    > relbemp block_name element_name where_link
        ^=> crebemp block_name element_name &&
            linbemp block_name/element_name where_link

    where:
      block_name - name of target block
      element_name - name of target element
      where_link - way to file, where need to paste link

    params:
      -pug - don't make pug link
      -sass - don't make sass link
      -js - don't make js link
      -end - add link to end of files

      For example:
      > relbemp block element ./another_block -pug -sass
        ^=> create block and add only js link
    `;
  console.log(help);
}
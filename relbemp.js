// Description
//   relbemp - relation bempie
//   relbemp = crebemp + linbemp
// Usage:
//   relbemp block element where_link
//   relbemp block where_link

const { exec } = require('child_process'), path = require('path');
const
  crebemp = require('./crebemp'),
  linbemp = require('./linbemp');
const argv = process.argv.slice(2);

if (argv.length == 0 || argv.some(arg => arg.match(/(--help|\/\?)/))) {
  help();
  process.exit();
}

main().then(() => process.exit());

async function main() {
  let linkParamsIndexes = [
    argv.findIndex(arg => arg.match(/^-pug/)),
    argv.findIndex(arg => arg.match(/^-sass/)),
    argv.findIndex(arg => arg.match(/^-js/)),
    argv.findIndex(arg => arg.match(/^-end/))
  ];
  linkParamsIndexes = linkParamsIndexes.filter(i => i >= 0);

  const linkParams = linkParamsIndexes.map(i => argv[i]);

  linkParamsIndexes.forEach(i => argv.splice(i, 1));

  let argLen = argv.length;
  if (argLen === 1) {
    await crebemp([argv[0]]);
  }
  else if (argLen === 2) {
    let res = await crebemp([argv[0]]);
    if (res !== null)
      await linbemp([argv[0], argv[1], ...linkParams]);
  }
  else if (argLen === 3) {
    let res = await crebemp([argv[0], argv[1]]);
    if (res !== null)
      await linbemp([`${argv[0]}/__${argv[1]}`, argv[2], ...linkParams]);
  }
  else
    console.log('Error: Given to much args to relbemp.');
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

function run(command) {
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log(`Error: ${err}\nStdout: ${stdout}\nStderr: ${stderr}`);
      process.exit();
    } else {
      console.log(stdout);
    }
  });
}
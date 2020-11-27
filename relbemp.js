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
  
  // taking insert link params
  let linkParams;
  // if params sended
  if (argv[argv.length - 1].startsWith('-')) {
    linkParams = argv.pop();
  } else { // else using default params
    linkParams = '-PSJ'; // all to begin of file
  }

  let argLen = argv.length;
  if (argLen === 1) {
    await crebemp([argv[0]]);
  }
  else if (argLen === 2) {
    let res = await crebemp([argv[0]]);
    if (res !== null)
      await linbemp([argv[0], argv[1], linkParams]);
  }
  else if (argLen === 3) {
    let res = await crebemp([argv[0], argv[1]]);
    if (res !== null)
      await linbemp([`${argv[0]}/__${argv[1]}`, argv[2], linkParams]);
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
      * letter size as association to TOP (file start) and bottom (file end)

      -j - js file add link at END
      -J - js file add link at START
      -s - sass file add link at END
      -S - sass file add link at START
      -p - pug file add link at END
      -P - pug file add link at START
      If no params given using default -PSJ (all links in start of file).
      You can use any combination, e.g. -psjPSJ, -pS or -pPjJ and so on.
      Order of params doesn't matter.

    examples:
      1) create menu BLOCK and add link to bundle files
        relbemp Block/menu ./   - create and link to start of all files
        relbemp Block/menu ./ -P  - create and link to just start of pug file
        relbemp Block/menu ./ -pP  - create and link to just start and end of pug file
        relbemp Block/menu ./ -jsp  - create and link to end of all files
        relbemp Block/menu ./ -jspJSP  - create and link to start and end of all files
      2) create menu list item ELEMENT and link to menu
        relbemp Block/menu list-item Block/menu   - add folder __list-item and links to
                                                    start of all files in menu folder
      3) using as crebemp
        relbemp Block/menu   - just create menu block

    not bug, but feature:
      If block or element is already exist
      program will as 'should folder to be replaced?'.
      If you'll answer something other then 'yes' in
      any format, then folder WILL NOT BE REPLACED, but
      LINK WILL BE CREATED.
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
const fs = require('fs'),
    { exec } = require('child_process'),
    { resolve, relative, join } = require('path'),
    readline = require('readline').createInterface(process.stdin, process.stdout);

async function ask(question) {
    return new Promise(resolve => {
        readline.question(question, answer => {
            resolve(answer);
        });
    });
}

const dir = process.cwd();
const argv = process.argv.slice(2);

/**
 * @typedef InsertionData
 * @property {String|Boolean} filename
 * @property {Number} insertPosition
 * @property {String} data
 * 
 * @function
 * @name insertToFiles
 * @param {Array<InsertionData>} files - insertion data
 */
function insertToFiles(files) {
    for (const insertionData of files) {
        const fileContent = fs.readFileSync(insertionData.filename);
        if (typeof insertionData.insertPosition == "boolean") {
            if (insertionData.insertPosition) {
                insertionData.insertPosition = fileContent.length;
            } else {
                insertionData.insertPosition = 0;
            }
        }
        const newContent =
            fileContent.slice(0, insertionData.insertPosition) +
            insertionData.data +
            fileContent.slice(insertionData.insertPosition);
        fs.writeFileSync(insertionData.filename, newContent);
    }
};

function help() {
    let help = `
    > linbemp source target [-pug] [-sass] [-js]

    where:
        source - source entity
        target - entity to add link to source entity
        --------------------------------
        -pug - don't create link in target pug file
        -sass - don't create link in target sass file
        -js - don't create link in target js file

    works:
        insert relative link to source into begin of target
    `;
    console.log(help);
}

async function main() {

    if (argv.some(arg => arg.match(/(--help|\/\?)/))) {
        help();
        process.exit();
    }

    const isNoPug = argv.find(arg => arg.match(/^-pug/));
    const isNoSass = argv.find(arg => arg.match(/^-sass/));
    const isNoJs = argv.find(arg => arg.match(/^-js/));

    const source = resolve(dir, argv[0]);
    const target = resolve(dir, argv[1]);

    //console.log(`Source: ${source}`);
    //console.log(`Target: ${target}`);

    const targetDir = fs.readdirSync(target);
    const targetPug = targetDir.find(filename => filename.match(/.pug$/));
    const targetSass = targetDir.find(filename => filename.match(/.sass$/));
    const targetJs = targetDir.find(filename => filename.match(/.js$/));

    let link;
    const linkWay = relative(target, source);
    const linkWaySplit = linkWay.split(/[\/\\]/);
    const elementOrBlock = linkWaySplit.pop();

    if (!elementOrBlock.match(/^__/)) {
        //block mode
        //block->any;
        const blockName = elementOrBlock;
        link = join(linkWay, blockName);
    } else {
        //element mode
        //element->any
        const elementName = elementOrBlock.replace(/^__/, '');
        const blockName = linkWaySplit.pop();
        link = join(linkWay, `${blockName}__${elementName}`);
    }

    const insertion = [];
    if (!isNoPug)
        insertion.push({
            filename: resolve(target, targetPug),
            insertPosition: 0,
            data: `include ${link}.pug\n`
        });

    if (!isNoSass)
        insertion.push({
            filename: resolve(target, targetSass),
            insertPosition: 0,
            data: `@import ${link}\n`
        });

    if (!isNoJs)
        insertion.push({
            filename: resolve(target, targetJs),
            insertPosition: 0,
            data: `import './${link}';\n`
        });

    insertToFiles(insertion);



    process.exit();
}

main();
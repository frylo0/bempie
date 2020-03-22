const fs = require('fs'),
    { exec } = require('child_process'),
    { resolve } = require('path'),
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

fs.createFiles = function (files) {
    for (const filename in files) {
        const filecontent = files[filename];
        fs.writeFileSync(resolve(dir, filename), filecontent);
    }
};

function help() {
    let help = `
    > crebemp block_name [element_name]    

    where:
        block_name - name of target block
        element_name - name of target element

    works:
        if (!element_name)
            create ./block_dir
            create block_files (pug, sass, js) in ./block_dir
        else
            create ./block_dir/element_dir
            create element_files (pug, sass, js) in ./block_dir/element_dir
    `;
    console.log(help);
}

async function main() {

    if (argv.length == 0 || argv.some(arg => arg.match(/(--help|\/\?)/))) {
        help();
        process.exit();
    }

    let target = argv[0];
    const block = target;
    const element = argv[1];

    let blockName = block.split(/[\/\\]/).pop();

    if (element) {
        target = resolve(target, '__' + element);
    }

    if (fs.existsSync(target)) {
        if ((await ask(`BEM ${element ? 'Element' : 'Block'} already exist. Replace? (yes|y|да|д): `)).match(/(yes|y|да|д)/i)) {
            fs.rmdirSync(target, { recursive: true });
        } else {
            process.exit();
        }
    }

    fs.mkdirSync(target);

    if (element) {
        blockName = `${blockName}__${element}`;
    }
    const blockFilenameBasis = `${target}/${blockName}`;
    fs.createFiles({
        [blockFilenameBasis + '.pug']: `mixin ${blockName}()
    .${blockName}&attributes(attributes)
        `,
        [blockFilenameBasis + '.sass']: `.${blockName}
    `,
        [blockFilenameBasis + '.js']: ''
    });


    process.exit();
}

main();
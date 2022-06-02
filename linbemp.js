async function linbemp(argv) {
    const fs = require('fs'),
        { exec } = require('child_process'),
        { resolve, relative, pathJoin } = require('path'),
        readline = require('readline').createInterface(process.stdin, process.stdout);
    
    function join(...parts) {
        parts = parts.map(part => part.replace(/\\/g, '/'));
        return parts.join('/'); // force slash for paths
        // return pathJoin(...parts); // system preference delimeter
    }
    
    function isFile(fullpath) {
        return fs.statSync(fullpath).isFile();
    }

    // kind of Console.ReadLine
    async function ask(question) {
        return new Promise(resolve => {
            readline.question(question, answer => {
                resolve(answer);
            });
        });
    }

    const dir = process.cwd();

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
        // args: files - array of insertion data objects, each in format {filename, insertPosition, data}
        for (const insertionData of files) { // iteration in all 
            const fileContent = fs.readFileSync(insertionData.filename); // reading target file content
            if (typeof insertionData.insertPosition == "boolean") { // if insert position is true or false
                if (insertionData.insertPosition) { // if true means end of file
                    insertionData.insertPosition = fileContent.length;
                } else { // if false means start of file
                    insertionData.insertPosition = 0;
                }
            }
            const newContent = // inserting data to file content
                fileContent.slice(0, insertionData.insertPosition) +
                insertionData.data +
                fileContent.slice(insertionData.insertPosition);
            fs.writeFileSync(insertionData.filename, newContent); // updating file content
        }
    };

    function help() {
        let help = `
    > linbemp source target -jpsJPS

    where:
        source - source entity
        target - entity to add link to source entity
        --------------------------------
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

    works:
        insert relative link to source into begin of target

    examples:

        1) insert link to menu into bundle files:
        linbemp Block/menu ./   - start of all files
        linbemp Block/menu ./ -P  - just start of pug file
        linbemp Block/menu ./ -pP  - just start and end of pug file
        linbemp Block/menu ./ -jsp  - end of all files
        linbemp Block/menu ./ -jspJSP  - start and end of all files

        2) from blocks folder, menu to bundle:
        linbemp menu ../   - start of all files

        3) to target file
        linbemp menu ../Pages/home.pug -P  - add link to start of home.pug
        linbemp menu ../Pages/home.scss -S  - add link to start of home.scss
        linbemp menu ../Pages/home.js -J  - add link to start of home.js
    `;
        console.log(help);
    }

    async function main() {

        // if help just print help
        if (argv.length == 0 || argv.some(arg => arg.match(/(--help|\/\?)/))) {
            help(); return; // print help and exit
        }

        // taking insert params
        let params = [];
        // if params sended
        if (argv[argv.length - 1].startsWith('-')) {
            params = argv.pop().split(''); // to char array
            params.shift(); // -PjS - removing '-'
        } else { // else using default params
            params = 'PSJ'.split(''); // all to begin of file
        }

        // source - folder to link
        // target - folder from link to source
        const source = resolve(dir, argv[0]);
        const target = resolve(dir, argv[1]);
        
        const getFilePath = (target, extensionRegex) => {
            const isTargetAFile = isFile(target);
            if (isTargetAFile) { // is file
                const isMatchExtension = extensionRegex.test(target);
                return isMatchExtension ? target : '';
            } else { // is dir
                const targetDir = fs.readdirSync(target);
                return targetDir.find(filename => extensionRegex.test(filename)) || '';
            }
        }

        // filenames in target folder
        const targetPugFilename = getFilePath(target, /\.pug$/i);
        const targetSassFilename = getFilePath(target, /\.s[ac]ss$/i);
        const targetJsFilename = getFilePath(target, /\.(mj|cj|t|j)s$/i);

        const isScssMode = targetSassFilename.endsWith('.scss');

        let link; // link string
        let linkWay = relative(target, source); // way from target to source
        
        if (isFile(target) && linkWay.startsWith('..'))
            linkWay = linkWay.replace(/^(\.[\/\\])?\.\.[\/\\]/, '');

        const linkWaySplit = linkWay.split(/[\/\\]/); // way to array of folders
        const elementOrBlock = linkWaySplit.pop(); // source last folder
        
        if (!elementOrBlock.match(/^__/)) { // if source last folder NOT in format '__{any}'
            // then BLOCK mode
            // block->any;
            const blockName = elementOrBlock;
            link = join(linkWay, blockName); // we have link to block
        } else { // else source last folder IN format '__{any}'
            // so ELEMENT mode
            // element->any
            const elementName = elementOrBlock.replace(/^__/, ''); // taking element name
            let blockName = linkWaySplit.pop(); // pop again to take block name
            if (!blockName) blockName = target.split(/[\/\\]/).pop(); // if bad relative link (e.g. './../') then block name in target full path
            link = join(linkWay, `${blockName}__${elementName}`); // we have link to element now
        }

        const insertion = []; // array of params for insertToFiles function
        // checking params
        // param: pug file end
        if (paramsHas('p'))
            insertion.push({
                filename: resolve(target, targetPugFilename),
                insertPosition: true,
                data: `include ${link}.pug\n`
            });
        // param: pug file start
        if (paramsHas('P'))
            insertion.push({
                filename: resolve(target, targetPugFilename),
                insertPosition: 0,
                data: `include ${link}.pug\n`
            });
        // param: sass file end
        if (paramsHas('s'))
            insertion.push({
                filename: resolve(target, targetSassFilename),
                insertPosition: true,
                data: isScssMode
                    ? `@import '${link}.scss';\n`
                    : `@import ${link}\n`
            });
        // param: sass file start
        if (paramsHas('S'))
            insertion.push({
                filename: resolve(target, targetSassFilename),
                insertPosition: 0,
                data: isScssMode
                    ? `@import '${link}.scss';\n`
                    : `@import ${link}\n`
            });
        // param: 
        if (paramsHas('j'))
            insertion.push({
                filename: resolve(target, targetJsFilename),
                insertPosition: true,
                data: `import './${link}';\n`
            });
        if (paramsHas('J'))
            insertion.push({
                filename: resolve(target, targetJsFilename),
                insertPosition: 0,
                data: `import './${link}';\n`
            });

        insertToFiles(insertion); // inserting all links to files

        return;

        /**
         * check given param is in params array
         * @returns {boolean} is param in params array */
        function paramsHas(paramName) {
            return params.indexOf(paramName) > -1;
        }
    }

    await main();
}

// script can be independent or module
if (require.main == module) {
    linbemp(process.argv.slice(2)).then(() => process.exit());
} else {
    module.exports = linbemp;
}
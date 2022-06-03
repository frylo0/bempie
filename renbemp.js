async function renbemp(argv) {
   const fs = require('fs'),
      path = require('path'),
      { exec } = require('child_process'),
      readline = require('readline').createInterface(process.stdin, process.stdout);

   async function ask(question) {
      return new Promise(resolve => {
         readline.question(question, answer => {
            resolve(answer);
         });
      });
   }

   const dir = process.cwd();

   function help() {
      let help = `
    > renbemp rel/path/to/block newName

    works:
      if (block exists)
        rename all block file names
        scan files content and rename block name usages
        rename block folder
      else
        error "block doesn't exist"
    `;
      console.log(help);
   }

   async function main() {
      if (argv.length == 0 || argv.some(arg => arg.match(/(--help|\/\?)/))) {
         help(); return;
      }

      let target = path.join(dir, argv[0]);
      const oldName = target.split(/[\/\\]/).pop();
      const newName = argv[1];

      if (fs.existsSync(target)) {
         if ((await ask(`BEM Block will be renamed. Are you sure? (yes|y|да|д): `)).match(/(yes|y|да|д)/i)) {
            // Rename files & Replace block name usages in file content
            const renameEntity = (targetBasis, targetExt, oldName, newName, replaceContentCallback) => {
               const targetPath = targetBasis + '.' + targetExt;
               const newPath = targetBasis.replace(new RegExp(`${oldName}$`), newName) + '.' + targetExt;
               
               if (fs.existsSync(targetPath)) {
                  fs.renameSync(targetPath, newPath);
                  
                  const oldContent = fs.readFileSync(newPath).toString();
                  const newContent = replaceContentCallback(oldName, newName, oldContent);
                  fs.writeFileSync(newPath, newContent);
               }
            };

            const blockFilenameBasis = path.join(target, oldName);
            
            renameEntity(blockFilenameBasis, 'pug', oldName, newName, (oldName, newName, content) => {
               return content
                  .replace(new RegExp(`mixin ${oldName}`), `mixin ${newName}`)
                  .replace(new RegExp(oldName, 'g'), newName);
            });
            renameEntity(blockFilenameBasis, 'scss', oldName, newName, (oldName, newName, content) => {
               return content
                  .replace(new RegExp(String.raw`\.${oldName}`, 'g'), `.${newName}`);
            });
            renameEntity(blockFilenameBasis, 'sass', oldName, newName, (oldName, newName, content) => {
               return content
                  .replace(new RegExp(String.raw`\.${oldName}`, 'g'), `.${newName}`);
            });
            renameEntity(blockFilenameBasis, 'js', oldName, newName, (oldName, newName, content) => {
               return content
                  .replace(new RegExp(String.raw`\.${oldName}`, 'g'), `.${newName}`)
                  .replace(new RegExp(String.raw`(["'])${oldName}`, 'g'), `$1${newName}`);
            });

            // Rename folder
            fs.renameSync(target, target.replace(new RegExp(`${oldName}$`), newName));
         }
      }
      else {
         console.error(`Error: Block "${path.join(dir, target)}" doesn't exist.`);
         return null;
      }

      return;
   }

   await main();
}

if (require.main == module) {
   renbemp(process.argv.slice(2)).then(() => process.exit());
} else {
   module.exports = renbemp;
}
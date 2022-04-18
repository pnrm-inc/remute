const path = require("path");
const glob = require("glob");
const yargs = require("yargs/yargs");
const remute = require('../index');

function run (argv) {
  const commandArgs = yargs(argv.slice(2)).argv;
  const files = commandArgs.files;
  const cwd = path.resolve(commandArgs.cwd) || process.cwd();
  const outputDir = path.resolve(commandArgs.output);

  const filePaths = glob.sync(files, {
    cwd
  });

  filePaths.forEach( (filePath) => {
    remute.renderFile({
      filePath: path.resolve(cwd, filePath),
      cwd,
      outputDir
    });
  });
}

module.exports = run;

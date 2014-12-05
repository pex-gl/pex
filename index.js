#!/usr/bin/env node

var program = require('commander');
var pkg = require(__dirname + '/package.json');
var version = pkg.version;
var docs = require('./lib/docs/docs.js');
var init = require('./lib/init/init.js');
var homepage = require('./lib/homepage/homepage.js');

var args = process.argv.slice(2);

program
  .usage('[command] [options]')
  .version(version)
  .option('-g, --grunt', 'add grunt build script')
  .option('-u, --gulp', 'add gulp build script')
  .option('-f, --force', 'force on non-empty directory')

program
  .command('init [projectName]')
  .description('generate example project')
  .action(function(name) {
    init.generate(name, {gulp: program.gulp, grunt: program.grunt});
  });

program
  .command('docs')
  .description('generate docs from node_modules folder in the current directory')
  .action(function(){
    console.log('generating pretty docs');
    docs.generate()
  });

program
  .command('homepage [mode]')
  .description('generate pex homepage')
  .action(function(mode) {
    if (mode == 'docs') homepage.generateDocs();
    else if (mode == 'examples') homepage.generateExamples();
    else if (mode == 'projects') homepage.generateProjects();
    else if (mode == 'page') homepage.generatePage();
    else homepage.generate();
  });

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ pex init projectName');
  console.log('    $ pex docs');
  console.log('');
});

program.parse(process.argv);

if (process.argv.length == 2) {
  program.help();
}

var destPath = program.args.shift() || '.';



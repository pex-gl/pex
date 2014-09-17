#!/usr/bin/env node

var program = require('commander');
var pkg = require(__dirname + '/package.json');
var version = pkg.version;
var docs = require('./lib/docs/docs.js');
var init = require('./lib/init/init.js');

var args = process.argv.slice(2);

program
  .usage('[command / projectName] [options]')
  .version(version)
  .option('-g, --grunt', 'add grunt build script')
  .option('-u, --gulp', 'add gulp build script')
  .option('-f, --force', 'force on non-empty directory')

program
  .command('docs')
  .description('generate docs from node_modules folder')
  .action(function(){
    console.log('generating pretty docs');
    docs.generate()
  });

program
  .command('init')
  .description('generate example project')
  .action(function(name) {
    init.generate(name, {gulp: program.gulp, grunt: program.grunt});
  });

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ pex');
  console.log('    $ pex projectName --grunt');
  console.log('    $ pex docs');
  console.log('');
});

program.parse(process.argv);

if (process.argv.length == 2) {
  program.help();
}

var destPath = program.args.shift() || '.';



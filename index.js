#!/usr/bin/env node

var program = require('commander');
var pkg = require(__dirname + '/package.json');
var version = pkg.version;
var init = require('./lib/init/init.js');

var args = process.argv.slice(2);

program
  .usage('[command] [options]')
  .version(version)
  .option('-f, --force', 'force on non-empty directory')

program
  .command('init [projectName]')
  .description('generate example project')
  .action(function(name) {
    init.generate(name);
  });

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ pex init projectName');
  console.log('');
});

program.parse(process.argv);

if (process.argv.length == 2) {
  program.help();
}

var destPath = program.args.shift() || '.';

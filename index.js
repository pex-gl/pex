#!/usr/bin/env node

var program = require('commander');
var pkg = require(__dirname + '/package.json');
var version = pkg.version;
var fs = require('fs-extra');
var path = require('path');
var docs = require('./lib/docs/docs.js');

var args = process.argv.slice(2);

program
  .version(version)

program.command('docs')
  .action(function(){
    docs.generate()
  });

program.parse(process.argv);

if (process.argv.length == 2) {
  program.help();
}

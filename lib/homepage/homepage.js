var init = require('../init/init');
var docs = require('../docs/docs');
var exec = require('child_process').exec;
var Promise = require('bluebird');
var clc = require('cli-color');
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

var packages = [
  //core
  { name : 'pex-color' },
  { name : 'pex-fx' },
  { name : 'pex-gen' },
  { name : 'pex-geom' },
  { name : 'pex-glu' },
  { name : 'pex-gui' },
  { name : 'pex-helpers' },
  { name : 'pex-materials' },
  { name : 'pex-sys' },
  { name : 'pex-random' },
  ////contrib
  { name : 'pex-space-colonization' }
];

//just run the command no matter what
function execP(cmd) {
  return function() {
    return new Promise(function(resolve, reject) {
      exec(cmd,
        function (err, stdout, stderr) {
          console.log(err || stdout || stderr);
          resolve(err || stdout || stderr);
      });
    })
  }
}

function logP(msg) {
  return function() {
    console.log(clc.cyan(msg));
    return Promise.resolve(true);
  }
}

function installPexPackages() {
  return Promise.all(packages.map(function(pkg) {
    return execP('npm install ' + pkg.name)();
  }))
}

function getExamplesList() {
  return fs.readdirSync('examples');
}

function getPackageInfo(pkg) {
  var classes = [];
  var version = '0.0.0';
  var homepage = '';
  try {
    classes = fs.readdirSync('docs/' + pkg.name + '');
    classes = classes.filter(function(classFile) {
      return path.extname(classFile) == '.html';
    })
    classes = classes.map(function(classFile) {
      var validDocs = true;
      var file = 'docs/' + pkg.name + '/' + classFile;
      var docHtml = fs.readFileSync(file, 'utf8');
      if (docHtml.indexOf('<h1') == -1) validDocs = false;
      if (docHtml.indexOf('<h2') == -1) validDocs = false;
      return {
        name: classFile.replace('.html', ''),
        validDocs: validDocs
      };
    });
  }
  catch(e) {
    console.log(e.stack)
  }

  try {
    var pkgJson = JSON.parse(fs.readFileSync('node_modules/' + pkg.name + '/package.json'));
    version = pkgJson.version;
    homepage = pkgJson.homepage;
  }
  catch(e) {
  }

  return {
    name: pkg.name,
    version: version,
    homepage: homepage,
    classes: classes
  }
}

function getProjectsList() {
  var projects = [];
  try {
    projects = JSON.parse(fs.readFileSync('projects/projects.json'));
    projects.forEach(function(project) {
      if (project.thumb.indexOf('http') == -1) {
        project.thumb = 'projects/' + project.thumb;
      }
    })
  }
  catch(e) {
  }
  console.log('projects', projects);
  return projects;
}

function generateIndexFile() {
  return new Promise(function(resolve, reject) {
    var templateSrc = fs.readFileSync(__dirname + '/templates/index.hbt', 'utf8');
    var template = Handlebars.compile(templateSrc);
    var projects = getProjectsList();
    var examples = getExamplesList();
    var pexPackages = packages.map(getPackageInfo);

    var indexHtml = template({ projects: projects, packages: pexPackages, examples: examples })
    fs.writeFileSync('index.html', indexHtml);
    resolve(true);
  })
}

function generate() {
  logP('generate homepage')()
  .then(logP('installing pex modules'))
  .then(execP('mkdir node_modules'))
  .then(installPexPackages)
  .then(logP('generating docs'))
  .then(execP('pex docs'))
  .then(logP('downloading examples'))
  .then(execP('git clone http://github.com/vorg/pex-examples/'))
  .then(logP('building examples'))
  .then(execP('cd pex-examples; npm install; gulp dist'))
  .then(logP('moving examples up'))
  .then(execP('mv pex-examples/dist/examples .'))
  .then(logP('downloading featured project list'))
  .then(execP('git clone http://github.com/vorg/pex-projects/ projects'))
  .then(logP('copying assets'))
  .then(execP('cp -r ' + __dirname + '/templates/css .'))
  .then(execP('cp -r ' + __dirname + '/templates/js .'))
  .then(execP('cp -r ' + __dirname + '/templates/lib .'))
  .then(logP('generating index file'))
  .then(generateIndexFile)
  .then(logP('removing temp files'))
  .then(execP('rm -r node_modules'))
  .then(execP('rm -r pex-examples'))
  .then(execP('open index.html'))
  .then(logP('done'))
}

module.exports.generate = generate;
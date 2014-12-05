var init = require('../init/init');
var docs = require('../docs/docs');
var exec = require('child_process').exec;
var Promise = require('bluebird');
var clc = require('cli-color');
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

var corePackages = require('../pkg/pex-packages-core');
var contribPackages = require('../pkg/pex-packages-contrib');

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
  return Promise.all(corePackages.map(function(pkg) {
    return execP('cd pex-homepage/temp; npm install ' + pkg.name)();
  }))
}

function getExamplesList() {
  return fs.readdirSync('pex-homepage/examples');
}

function getPackageInfo(pkg) {
  var classes = [];
  var version = '0.0.0';
  var homepage = '';
  try {
    var pkgDocsPath = 'pex-homepage/docs/' + pkg.name + '';
    console.log(pkgDocsPath)
    if (fs.existsSync(pkgDocsPath)) {
      classes = fs.readdirSync(pkgDocsPath);
      classes = classes.filter(function(classFile) {
        return path.extname(classFile) == '.html';
      })
      classes = classes.map(function(classFile) {
        var validDocs = true;
        var file = 'pex-homepage/docs/' + pkg.name + '/' + classFile;
        var docHtml = fs.readFileSync(file, 'utf8');
        if (docHtml.indexOf('<h1') == -1) validDocs = false;
        if (docHtml.indexOf('<h2') == -1) validDocs = false;
        return {
          name: classFile.replace('.html', ''),
          validDocs: validDocs
        };
      });
    }
  }
  catch(e) {
    console.log(e.stack)
  }

  try {
    var pkgJson = JSON.parse(fs.readFileSync('pex-homepage/temp/node_modules/' + pkg.name + '/package.json'));
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
    projects = JSON.parse(fs.readFileSync('pex-homepage/projects/projects.json'));
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
    var corePackagesInfo = corePackages.map(getPackageInfo);
    var contribPackagesInfo = contribPackages.map(getPackageInfo);

    console.log(contribPackagesInfo)

    var indexHtml = template({ projects: projects, corePackages: corePackagesInfo, contribPackages: contribPackagesInfo, examples: examples })
    fs.writeFileSync('pex-homepage/index.html', indexHtml);
    resolve(true);
  })
}

function generateDocs() {
  return logP('generate docs')()
  .then(logP('cleaning docs'))
  .then(execP('rm -rf pex-homepage/docs'))
  .then(execP('rm -rf pex-homepage/temp/docs'))
  .then(logP('installing pex modules'))
  .then(execP('mkdir -p pex-homepage/temp/node_modules'))
  .then(installPexPackages)
  .then(logP('generating docs'))
  .then(execP('cd pex-homepage/temp; pex docs'))
  .then(logP('moving docs up'))
  .then(execP('mv pex-homepage/temp/docs pex-homepage'))
}

function generateExamples() {
  return logP('generate examples')()
  .then(logP('cleaning examples'))
  .then(execP('rm -rf pex-homepage/examples'))
  .then(execP('rm -rf pex-homepage/temp/pex-examples'))
  .then(logP('downloading examples'))
  .then(execP('git clone http://github.com/vorg/pex-examples/ pex-homepage/temp/pex-examples'))
  .then(logP('building examples (this will take a while...)'))
  .then(execP('cd pex-homepage/temp/pex-examples; npm install; gulp dist'))
  .then(logP('moving examples up'))
  .then(execP('mv pex-homepage/temp/pex-examples/dist/examples pex-homepage'))
}

function generateProjects() {
  return logP('generate projects')()
  .then(logP('cleaning projects'))
  .then(execP('rm -rf pex-homepage/projects'))
  .then(logP('downloading featured project list'))
  .then(execP('git clone http://github.com/vorg/pex-projects/ pex-homepage/temp/pex-projects'))
  .then(logP('moving projects up'))
  .then(execP('mkdir -p pex-homepage/projects'))
  .then(execP('mv pex-homepage/temp/pex-projects/assets pex-homepage/projects'))
  .then(execP('mv pex-homepage/temp/pex-projects/projects.json pex-homepage/projects'))
}

function generatePage() {
  return logP('generate page')()
  .then(logP('copying assets'))
  .then(execP('cp -r ' + __dirname + '/templates/css pex-homepage'))
  .then(execP('cp -r ' + __dirname + '/templates/js pex-homepage'))
  .then(execP('cp -r ' + __dirname + '/templates/lib pex-homepage'))
  .then(logP('generating index file'))
  .then(generateIndexFile)
  .then(execP('open pex-homepage/index.html'))
}

function clean() {
  return logP('clean')()
  .then(logP('removing temp files'))
  .then(execP('rm -r pex-homepage/temp'))
}

function generate() {
  logP('generate homepage')()
  .then(generateDocs)
  .then(generateExamples)
  .then(generateProjects)
  .then(generatePage)
  .then(clean)
  .then(logP('done all'))
}

module.exports.generate = generate;
module.exports.generateDocs = generateDocs;
module.exports.generateExamples = generateExamples;
module.exports.generateProjects = generateProjects;
module.exports.generatePage = generatePage;
module.exports.generate = generate;
var fs = require('fs-extra');
var path = require('path');
var validHeaders = '1234567';

function copyTemplates() {

  fs.copy(__dirname + '/templates/sidebar.css', './docs/sidebar.css', function(err){
    if (err) return console.error(err);
  });

  fs.copy(__dirname + '/templates/public', './docs/public', function(err){
    if (err) return console.error(err);
  });
}

module.exports.generate = function() {

  copyTemplates();
  var doneFolders = 0;
  var pexDir = path.resolve('node_modules');
  var pexLibs = fs.readdirSync(pexDir);

  pexLibs = pexLibs
  // Pass only pex libs
  .filter(function(dir) {
    return dir.substring(0,4) === 'pex-';
  });

  // Iterate over pex libs
  pexLibs.forEach(function(dir) {
    var pexLibName = dir;
    var pathForDir = path.join(pexDir, dir);

    if (fs.lstatSync(pathForDir).isFile()) {
      console.log('skipping', pathForDir, 'is a file')
      return;
    }

    var pathForLib = path.join(pathForDir, 'lib');

    var files = [];

    if (!fs.existsSync(pathForLib)) {
      console.log('warning', pathForDir, 'has no lib subfolder');
    }
    else {
      files = fs.readdirSync(pathForLib);
    }

    files = files.filter(function(file){
      return path.extname(file) === '.js';
    });

    function processNext() {
      var file = files.shift();
      if (!file) {
        doneFolders++;
        console.log('processed', pathForDir, doneFolders + '/' + pexLibs.length);
        if (doneFolders === pexLibs.length) generateIndex('docs');
        return;
      }
      var pathForJsFile = path.join(pathForLib, file);
      var spawn = require('child_process').spawn;
      var docco = spawn('docco',
                        [pathForJsFile,
                        '-o',
                        'docs/' + pexLibName,
                        '-l',
                        'classic',
                        '-c',
                        __dirname + '/templates/docco.css'
                        ]);

      docco.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
      });

      docco.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
      docco.on('close', function(code) {
      //  console.log(code)
        processNext();
      });

    }

    processNext();
  });
}

function generateIndex(dir) {
  console.log('generating index');

  var docsDir = path.resolve(dir);
  dirs = fs.readdirSync(docsDir);
  var dirs = dirs
  .map(function(dir) {
    return path.join(docsDir, dir)
  })
  .filter(function(dir) {
    return fs.lstatSync(dir).isDirectory()
  })
  dirs.push(docsDir);
  var dirContents = dirs.map(function(dir) {
    return {
      dir: dir,
      files: scanDir(dir)
    };
  });
  buildIndexFile(dirContents);

  console.log('done');
}

function scanDir(dir) {
  var files = fs.readdirSync(dir);
  files = files.filter(function(file) {
    return path.extname(file) == '.html'
  });
  var filesIndices = files.map(function(file) {
    return {
      file: file,
      headers: scanFile(path.join(dir, file))
    };
  })

  return filesIndices;
}

function scanFile(file) {
  var lines = fs.readFileSync(file, 'utf8').split('\n');
  var headers = lines.filter(function(line) {
    return line.trim().match(new RegExp('\<h['+validHeaders+'].+'));
  }).map(function(line) {
    var tokens = line.trim().match(new RegExp('\<h['+validHeaders+']( id\=\"([^\"]+)\")?\>(.+)\<\/h['+validHeaders+']\>'));
    if (!tokens) console.log(line);
    return {
      id: tokens[2] || '',
      text: tokens[3]
    }
  });
  return headers;
}

function buildIndexFile(dirContents) {
  var lines = [];
  lines.push('<html>');
  lines.push('<head>');
  lines.push('<title> Pex Reference Docs </title>');
  lines.push('<link rel="stylesheet" type="text/css" href="sidebar.css">');
  lines.push('</head>');
  lines.push('<body>');
  lines.push('<div id="container">');
  lines.push('<div id="background"></div>');
  lines.push('<ul class="sections">');
  lines.push('<li class="title"><div class="annotation"><h1> Pex Reference Docs </h1></div></li>');
  dirContents.forEach(function(dirInfo) {
    if (dirInfo.files.length > 0) {
      lines.push('<li><div class="annotation">');
      lines.push('<h2>' + path.basename(dirInfo.dir) + '</h2>');
      dirInfo.files.forEach(function(fileInfo) {
        var fileUrl = path.join(path.basename(dirInfo.dir), path.basename(fileInfo.file));
        lines.push('<h4><a href="' + fileUrl + '" target="viewer">' + path.basename(fileInfo.file, '.html') + '</a></h4>');
        fileInfo.headers.forEach(function(headerInfo) {
          var headerUrl = path.join(path.basename(dirInfo.dir), path.basename(fileInfo.file)) + '#' + headerInfo.id;
          lines.push('<h5><a href="' + headerUrl + '" target="viewer">' + headerInfo.text + '</a><br/></h5>');
        })
      })
      lines.push('</div></li>');
    }
  });
  lines.push('</ul>');
  lines.push('</div>');
  lines.push('<iframe id="viewer" name="viewer"></iframe>');
  lines.push('</body>');
  lines.push('</html>');
//  console.log(lines.join('\n'));
  fs.writeFile('./docs/index.html', lines.join('\n'), function(err) {
    if(err) console.log(err);
  });
}

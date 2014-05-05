var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var plaskPath = process.argv[2];
var scriptPath = process.argv[3];
var dir = path.dirname(scriptPath);

var iterationCount = 0;
while(dir != '/' && ++iterationCount < 50) {
  var mainFile = path.join(dir,'/','index.js');
  if (fs.existsSync(mainFile)) {
    console.log(dir);
    var child = spawn(plaskPath,[mainFile], {cwd:dir+'/'});
    child.on('exit', function() {
    })
    child.stdout.on('data', function(data) {
      console.log(data.toString());
    });
    child.stderr.on('data', function(data) {
      console.log(data.toString());
    });
    break;
  }
  else {
    dir = path.resolve(path.join(dir, '/', '..'));
  }
}

if (dir == '/') {
  var mainFile = scriptPath;
  var child = spawn(plaskPath,[mainFile], {cwd:dir+'/'});
    child.on('exit', function() {
  })
  child.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  child.stderr.on('data', function(data) {
    console.log(data.toString());
  });
}
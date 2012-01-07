//goes through all js files in given directory and it's subdirectories
//and looks for js files and runs docco for them

var fs = require('fs');
var path = require('path');
var util = require('util');
var exec  = require('child_process').exec;

var moduleBasePath = "src/pex";
var directoriesToScan = [ moduleBasePath ];
var moduleNames = [];
var modules = [];
var verbose = true;
var filesToGenerate = 0;
var filesGenerated = 0;
var defineRegExp = new RegExp(/define\(\s*([a-zA-Z\/\"]*)?,*\s*(\[[^\]]*\])/);

function scanDir(dir) {
  if (verbose) console.log("Scanning " + dir);
  var files = fs.readdirSync(dir);
  
  for(var i=0; i<files.length; i++) {
    var file = dir + "/" + files[i];
    var stats = fs.statSync(file);
    if (stats.isDirectory()) {      
      directoriesToScan.push(file);
    }
    else if (stats.isFile()) {
      scanFile(file);
    }
  }
  scanNextDir();
}

function scanFile(file) {
  if (path.extname(file) != ".js") return;
  //if (verbose) console.log(" " + file);
  
  var dir = path.dirname(file);
  var dirs = dir.split("/");
  var module = dirs[dirs.length - 1];
  var className = path.basename(file, ".js");
  
  if (!modules[module]) {
    moduleNames.push(module);
    modules[module] = [];
  }
  
  modules[module].push(className);
  
  try {
    var fileStats = fs.statSync(file);
    var docStats = fs.statSync("docs/" + className + ".html");
    if (fileStats.mtime < docStats.mtime) {
      return;
    }
  }
  catch(e) {
    
  }
  
  filesToGenerate++;
  var child = exec('docco ' + file,
  //var child = exec('/Users/vorg/Dev/docco/bin/docco --structured ' + file,
  //var child = exec('/Users/vorg/Dev/docco-mbrevoort/bin/docco ' + file,  
    function (error, stdout, stderr) {
      filesGenerated++;
      if (verbose) console.log("Generated " + filesGenerated + "/" + filesToGenerate);
      if (verbose && filesGenerated == filesToGenerate) {
        console.log("Done generating");
        process.exit(0);
      }
  });
}

function scanNextDir() {
  if (directoriesToScan.length == 0) {
    if (verbose) console.log("Done scanning");    
    
    makeIndexFile();
    
    return;
  }
  var dir = directoriesToScan.shift();
  scanDir(dir);
}

function makeIndexFile() {
  var s = "";
  for(var i=0; i<moduleNames.length; i++) {
    var title = moduleNames[i];
    var moduleClasses = modules[moduleNames[i]];
    var modulePath = (title == "pex") ? "pex/" : "pex/" + title + "/";
    if (title != "pex") title = modulePath;
    s += "<h3>" + title + "</h3>\n";
    for(var j=0; j<moduleClasses.length; j++) {
      s += "&nbsp;- <a href='" + "src/" + modulePath + moduleClasses[j] + ".html'>" + moduleClasses[j] + "</a><br/>\n";
    }
    s += "<br/>";
  }
  
  var html = fs.readFileSync("tools/docs.index.tmpl", "utf-8");
  var html = html.replace("###", s);
  fs.writeFileSync("docs/index.html", html);
  
  if (verbose) console.log("Writing index file... done");
  if (verbose) console.log("Waiting to generate " + filesToGenerate + " files ...");
  if (filesToGenerate == 0) {
    process.exit(0);
  }  
}

scanNextDir();


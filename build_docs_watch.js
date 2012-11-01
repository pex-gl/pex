var fs = require("fs");
var exec = require("child_process").exec;
var file = "pex/cameras/PerspectiveCamera.js";

exec("cd src; ../tools/docco/bin/docco -name Pex -o ../docs " + file, function(err, out) {
    console.log(err);
    console.log(out);
});

fs.watchFile("src/" + file, function() {
    console.log(file, "was modified at " + new Date());
    exec("cd src; ../tools/docco/bin/docco -name Pex -o ../docs " + file);
});
define(["pex/sys/IO", "pex/core/Geometry", "pex/core/Vec3", "pex/core/Face3", "pex/core/Face4"], function(IO, Geometry, Vec3, Face3, Face4) {
  function OBJLoader() {

  }

  OBJLoader.load = function(file, callback) {
    IO.loadTextFile(file, function(text) {
      var geometry = OBJLoader.parse(text);
      callback(geometry);
    })
  }

  OBJLoader.parse = function(text) {
    var lines = text.split("\n");
    var geom = new Geometry();
    geom.vertices = [];
    geom.normals = [];
    geom.faces = [];
    for(var i=0; i<lines.length; i++) {
      var line = lines[i];
      var matches = null;

      if (matches = line.match(/v\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)) {
        var x = parseFloat(matches[1]);
        var y = parseFloat(matches[2]);
        var z = parseFloat(matches[3]);
        geom.vertices.push(new Vec3(x, y, z));
      }
      else if (matches = line.match(/vn\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)) {
        var x = parseFloat(matches[1]);
        var y = parseFloat(matches[2]);
        var z = parseFloat(matches[3]);
        geom.vertices.push(new Vec3(x, y, z));
      }
      else if (matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)) {
        var a = parseInt(matches[1]);
        var b = parseInt(matches[2]);
        var c = parseInt(matches[3]);
        var d = parseInt(matches[4]);
        if (a < 0) a = geom.vertices.length + a;
        if (b < 0) b = geom.vertices.length + b;
        if (c < 0) c = geom.vertices.length + c;
        if (d < 0) d = geom.vertices.length + d;
        geom.faces.push(new Face3(a, b, c));
        geom.faces.push(new Face3(a, c, d));
      }
      else if (matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)) {
        var a = parseInt(matches[1]);
        var b = parseInt(matches[2]);
        var c = parseInt(matches[3]);
        if (a < 0) a = geom.vertices.length + a;
        else a--;
        if (b < 0) b = geom.vertices.length + b;
        else b--;
        if (c < 0) c = geom.vertices.length + c;
        else c--;
        geom.faces.push(new Face3(a, b, c));
      }
      else {
        //console.log(line);
      }
    }
    if (geom.normals.length == 0) {
      geom.computeNormals();
    }
    console.log("Vertices count " + geom.vertices.length);
    console.log("Vertices normals " + geom.normals.length);
    console.log("Vertices faces " + geom.faces.length);
    return geom;
  }

  return OBJLoader;
});
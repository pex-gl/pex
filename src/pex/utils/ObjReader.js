(function() {
  define(function(require) {
    var Face3, Face4, Geometry, IO, ObjReader, Vec2, Vec3, _ref;
    IO = require('pex/sys').IO;
    _ref = require('pex/geom'), Geometry = _ref.Geometry, Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Face3 = _ref.Face3, Face4 = _ref.Face4;
    ObjReader = {};
    ObjReader.load = function(file, callback) {
      return IO.loadTextFile(file, function(text) {
        var geometry;
        geometry = ObjReader.parse(text);
        return callback(geometry);
      });
    };
    ObjReader.parse = function(text) {
      var geom, lines;
      lines = text.trim().split('\n');
      geom = new Geometry({
        vertices: true,
        faces: true,
        normals: true,
        texCoords: true
      });
      lines.forEach(function(line) {
        var a, b, c, d, matches, u, v, x, y, z;
        matches = null;
        matches = line.match(/v\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
        if (matches !== null) {
          x = parseFloat(matches[1]);
          y = parseFloat(matches[2]);
          z = parseFloat(matches[3]);
          geom.vertices.push(new Vec3(x, y, z));
          return;
        }
        matches = line.match(/vt\s+([^\s]+)\s+([^\s]+)/);
        if (matches !== null) {
          u = parseFloat(matches[1]);
          v = parseFloat(matches[2]);
          geom.texCoords.push(new Vec2(u, v));
          return;
        }
        matches = line.match(/vn\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
        if (matches !== null) {
          x = parseFloat(matches[1]);
          y = parseFloat(matches[2]);
          z = parseFloat(matches[3]);
          geom.normals.push(new Vec3(x, y, z));
          return;
        }
        matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
        if (matches !== null) {
          a = parseInt(matches[1]);
          b = parseInt(matches[2]);
          c = parseInt(matches[3]);
          d = parseInt(matches[4]);
          if (a < 0) {
            a = geom.vertices.length + a;
          } else {
            a--;
          }
          if (b < 0) {
            b = geom.vertices.length + b;
          } else {
            b--;
          }
          if (c < 0) {
            c = geom.vertices.length + c;
          } else {
            c--;
          }
          if (d < 0) {
            d = geom.vertices.length + d;
          } else {
            d--;
          }
          geom.faces.push(new Face3(a, b, c));
          geom.faces.push(new Face3(a, c, d));
          return;
        }
        matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
        if (matches !== null) {
          a = parseInt(matches[1]);
          b = parseInt(matches[2]);
          c = parseInt(matches[3]);
          if (a < 0) {
            a = geom.vertices.length + a;
          } else {
            a--;
          }
          if (b < 0) {
            b = geom.vertices.length + b;
          } else {
            b--;
          }
          if (c < 0) {
            c = geom.vertices.length + c;
          } else {
            c--;
          }
          geom.faces.push(new Face3(a, b, c));
          return;
        }
        if (ObjReader.verbose) {
          return console.log('ObjReader unknown line', line);
        }
      });
      if (geom.normals.length === 0) {
        delete geom.normals;
      }
      if (geom.texCoords.length === 0) {
        delete geom.texCoords;
      }
      if (ObjReader.verbose) {
        console.log("Vertices count " + geom.vertices.length);
      }
      if (ObjReader.verbose) {
        console.log("Vertices faces " + geom.faces.length);
      }
      return geom;
    };
    return ObjReader;
  });

}).call(this);

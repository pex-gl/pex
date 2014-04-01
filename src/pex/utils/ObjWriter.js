(function() {
  define(function(require) {
    var IO, ObjWriter;
    IO = require('pex/sys').IO;
    ObjWriter = {};
    ObjWriter.save = function(geometry, fileName, callback) {
      var s;
      s = ObjWriter.stringify(geometry);
      if (fileName.indexOf('/') !== -1) {
        return IO.saveTextFile(fileName, s, callback);
      } else {
        if (IO.getWorkingDirectory().length > 0) {
          return IO.saveTextFile(IO.getWorkingDirectory() + '/' + fileName, s, callback);
        } else {
          return IO.saveTextFile(fileName, s, callback);
        }
      }
    };
    ObjWriter.stringify = function(geometry) {
      var geometries, s, vertexCount, vertexOffset;
      geometries = null;
      if (Object.prototype.toString.call(geometry) === '[object Array]') {
        geometries = geometry;
      } else {
        geometries = [geometry];
      }
      vertexOffset = 0;
      vertexCount = 0;
      s = '#Obj v1.0\n';
      geometries.forEach(function(geometry, id) {
        var i, _i, _ref, _results;
        vertexOffset += vertexCount;
        vertexCount = 0;
        s += 'o Mesh' + id + '\n';
        geometry.vertices.forEach(function(v) {
          s += 'v ' + v.x + ' ' + v.y + ' ' + v.z + '\n';
          return vertexCount++;
        });
        if (geometry.texCoords) {
          geometry.texCoords.forEach(function(vt) {
            return s += 'vt ' + vt.x + ' ' + vt.y + '\n';
          });
        }
        if (geometry.normals) {
          geometry.normals.forEach(function(n) {
            return s += 'vn ' + n.x + ' ' + n.y + ' ' + n.z + '\n';
          });
        }
        if (geometry.faces && geometry.faces.length > 0) {
          return geometry.faces.forEach(function(f) {
            s += 'f ' + (f.a + 1) + '/' + (f.a + 1) + '/' + (f.a + 1) + ' ' + (f.b + 1) + '/' + (f.b + 1) + '/' + (f.b + 1) + ' ' + (f.c + 1) + '/' + (f.c + 1) + '/' + (f.c + 1);
            if (f.d) {
              s += ' ' + (f.d + 1);
            }
            return s += '\n';
          });
        } else {
          _results = [];
          for (i = _i = 0, _ref = geometry.vertices.length - 1; _i <= _ref; i = _i += 3) {
            _results.push(s += 'f ' + (vertexOffset + i + 1) + ' ' + (vertexOffset + i + 2) + ' ' + (vertexOffset + i + 3) + '\n');
          }
          return _results;
        }
      });
      return s;
    };
    return ObjWriter;
  });

}).call(this);

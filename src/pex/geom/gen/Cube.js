(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Cube, Face4, Geometry, Vec2, Vec3;
    Vec2 = require('pex/geom/Vec2');
    Vec3 = require('pex/geom/Vec3');
    Face4 = require('pex/geom/Face4');
    Geometry = require('pex/geom/Geometry');
    return Cube = (function(_super) {
      __extends(Cube, _super);

      function Cube(sx, sy, sz, nx, ny, nz) {
        var makePlane, numVertices, vertexIndex;
        sx = sx != null ? sx : 1;
        sy = sy != null ? sy : sx != null ? sx : 1;
        sz = sz != null ? sz : sx != null ? sx : 1;
        nx = nx || 1;
        ny = ny || 1;
        nz = nz || 1;
        numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
        Cube.__super__.constructor.call(this, {
          vertices: true,
          normals: true,
          texCoords: true,
          faces: true
        });
        vertexIndex = 0;
        makePlane = (function(_this) {
          return function(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
            var face, i, j, n, normal, texCoord, vert, vertShift, _i, _j, _k, _ref, _results;
            vertShift = vertexIndex;
            for (j = _i = 0; 0 <= nv ? _i <= nv : _i >= nv; j = 0 <= nv ? ++_i : --_i) {
              for (i = _j = 0; 0 <= nu ? _j <= nu : _j >= nu; i = 0 <= nu ? ++_j : --_j) {
                vert = _this.vertices[vertexIndex] = Vec3.create();
                vert[u] = (-su / 2 + i * su / nu) * flipu;
                vert[v] = (-sv / 2 + j * sv / nv) * flipv;
                vert[w] = pw;
                normal = _this.normals[vertexIndex] = Vec3.create();
                normal[u] = 0;
                normal[v] = 0;
                normal[w] = pw / Math.abs(pw);
                texCoord = _this.texCoords[vertexIndex] = Vec2.create();
                texCoord.x = i / nu;
                texCoord.y = 1.0 - j / nv;
                ++vertexIndex;
              }
            }
            _results = [];
            for (j = _k = 0, _ref = nv - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; j = 0 <= _ref ? ++_k : --_k) {
              _results.push((function() {
                var _l, _ref1, _results1;
                _results1 = [];
                for (i = _l = 0, _ref1 = nu - 1; 0 <= _ref1 ? _l <= _ref1 : _l >= _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
                  n = vertShift + j * (nu + 1) + i;
                  face = new Face4(n, n + nu + 1, n + nu + 2, n + 1);
                  _results1.push(this.faces.push(face));
                }
                return _results1;
              }).call(_this));
            }
            return _results;
          };
        })(this);
        makePlane('x', 'y', 'z', sx, sy, nx, ny, sz / 2, 1, -1);
        makePlane('x', 'y', 'z', sx, sy, nx, ny, -sz / 2, -1, -1);
        makePlane('z', 'y', 'x', sz, sy, nz, ny, -sx / 2, 1, -1);
        makePlane('z', 'y', 'x', sz, sy, nz, ny, sx / 2, -1, -1);
        makePlane('x', 'z', 'y', sx, sz, nx, nz, sy / 2, 1, 1);
        makePlane('x', 'z', 'y', sx, sz, nx, nz, -sy / 2, 1, -1);
      }

      return Cube;

    })(Geometry);
  });

}).call(this);

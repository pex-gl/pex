(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Edge, Face4, Geometry, Plane, Vec2, Vec3;
    Vec2 = require('pex/geom/Vec2');
    Vec3 = require('pex/geom/Vec3');
    Face4 = require('pex/geom/Face4');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    return Plane = (function(_super) {
      __extends(Plane, _super);

      function Plane(su, sv, nu, nv, u, v) {
        var edges, face, faces, i, j, n, normal, normals, texCoord, texCoords, vert, vertices, w, _i, _j, _k, _l;
        su = su || 1;
        sv = sv || su || 1;
        nu = nu || 1;
        nv = nv || nu || 1;
        u = u || 'x';
        v = v || 'y';
        w = ['x', 'y', 'z'];
        w.splice(w.indexOf(u), 1);
        w.splice(w.indexOf(v), 1);
        w = w[0];
        vertices = [];
        texCoords = [];
        normals = [];
        faces = [];
        edges = [];
        for (j = _i = 0; 0 <= nv ? _i <= nv : _i >= nv; j = 0 <= nv ? ++_i : --_i) {
          for (i = _j = 0; 0 <= nu ? _j <= nu : _j >= nu; i = 0 <= nu ? ++_j : --_j) {
            vert = new Vec3();
            vert[u] = -su / 2 + i * su / nu;
            vert[v] = -sv / 2 + j * sv / nv;
            vert[w] = 0;
            vertices.push(vert);
            texCoord = new Vec2(i / nu, 1.0 - j / nv);
            texCoords.push(texCoord);
            normal = new Vec3();
            normal[u] = 0;
            normal[v] = 0;
            normal[w] = 1;
            normals.push(normal);
          }
        }
        for (j = _k = 0; 0 <= nv ? _k <= nv : _k >= nv; j = 0 <= nv ? ++_k : --_k) {
          for (i = _l = 0; 0 <= nu ? _l <= nu : _l >= nu; i = 0 <= nu ? ++_l : --_l) {
            n = j * (nu + 1) + i;
            if (j < nv && i < nu) {
              face = new Face4(n, n + nu + 1, n + nu + 2, n + 1);
            }
            edges.push(new Edge(n, n + 1));
            edges.push(new Edge(n, n + nu + 1));
            if (j === nv - 1) {
              edges.push(new Edge(n + nu + 1, n + nu + 2));
            }
            if (i === nu - 1) {
              edges.push(new Edge(n + 1, n + nu + 2));
            }
            faces.push(face);
          }
        }
        Plane.__super__.constructor.call(this, {
          vertices: vertices,
          normals: normals,
          texCoords: texCoords,
          faces: faces,
          edges: edges
        });
      }

      return Plane;

    })(Geometry);
  });

}).call(this);

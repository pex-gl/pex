(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Edge, Face3, Geometry, Tetrahedron, Vec3;
    Vec3 = require('pex/geom/Vec3');
    Face3 = require('pex/geom/Face3');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    return Tetrahedron = (function(_super) {
      __extends(Tetrahedron, _super);

      function Tetrahedron(a) {
        var edges, faces, s3, s6, vertices;
        if (a == null) {
          a = 1;
        }
        s3 = Math.sqrt(3);
        s6 = Math.sqrt(6);
        vertices = [new Vec3(s3 / 3 * a, -s6 / 3 * a * 0.333 + s6 * 0.025, 0), new Vec3(-s3 / 6 * a, -s6 / 3 * a * 0.333 + s6 * 0.025, a / 2), new Vec3(-s3 / 6 * a, -s6 / 3 * a * 0.333 + s6 * 0.025, -a / 2), new Vec3(0, s6 / 3 * a * 0.666 + s6 * 0.025, 0)];
        faces = [new Face3(0, 1, 2), new Face3(3, 1, 0), new Face3(3, 0, 2), new Face3(3, 2, 1)];
        edges = [new Edge(0, 1), new Edge(0, 2), new Edge(0, 3), new Edge(1, 2), new Edge(1, 3), new Edge(2, 3)];
        Tetrahedron.__super__.constructor.call(this, {
          vertices: vertices,
          faces: faces,
          edges: edges
        });
      }

      return Tetrahedron;

    })(Geometry);
  });

}).call(this);

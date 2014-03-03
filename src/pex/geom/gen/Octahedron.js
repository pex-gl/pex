(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Edge, Face3, Geometry, Octahedron, Vec3;
    Vec3 = require('pex/geom/Vec3');
    Face3 = require('pex/geom/Face3');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    return Octahedron = (function(_super) {
      __extends(Octahedron, _super);

      function Octahedron(r) {
        var a, b, edges, faces, s3, s6, vertices;
        if (r == null) {
          r = 1;
        }
        r = r || 1;
        a = r * 1 / (2 * Math.sqrt(2));
        b = r * 1 / 2;
        s3 = Math.sqrt(3);
        s6 = Math.sqrt(6);
        vertices = [new Vec3(-a, 0, a), new Vec3(a, 0, a), new Vec3(a, 0, -a), new Vec3(-a, 0, -a), new Vec3(0, b, 0), new Vec3(0, -b, 0)];
        faces = [new Face3(3, 0, 4), new Face3(2, 3, 4), new Face3(1, 2, 4), new Face3(0, 1, 4), new Face3(3, 2, 5), new Face3(0, 3, 5), new Face3(2, 1, 5), new Face3(1, 0, 5)];
        edges = [new Edge(0, 1), new Edge(1, 2), new Edge(2, 3), new Edge(3, 0), new Edge(0, 4), new Edge(1, 4), new Edge(2, 4), new Edge(3, 4), new Edge(0, 5), new Edge(1, 5), new Edge(2, 5), new Edge(3, 5)];
        Octahedron.__super__.constructor.call(this, {
          vertices: vertices,
          faces: faces,
          edges: edges
        });
      }

      return Octahedron;

    })(Geometry);
  });

}).call(this);

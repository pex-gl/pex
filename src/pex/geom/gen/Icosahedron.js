(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Edge, Face3, Geometry, Icosahedron, Vec3;
    Vec3 = require('pex/geom/Vec3');
    Face3 = require('pex/geom/Face3');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    return Icosahedron = (function(_super) {
      __extends(Icosahedron, _super);

      function Icosahedron(r) {
        var a, b, edges, faces, phi, vertices;
        if (r == null) {
          r = 1;
        }
        r = r || 1;
        phi = (1 + Math.sqrt(5)) / 2;
        a = r * 1 / 2;
        b = r * 1 / (2 * phi);
        vertices = [new Vec3(0, b, -a), new Vec3(b, a, 0), new Vec3(-b, a, 0), new Vec3(0, b, a), new Vec3(0, -b, a), new Vec3(-a, 0, b), new Vec3(a, 0, b), new Vec3(0, -b, -a), new Vec3(a, 0, -b), new Vec3(-a, 0, -b), new Vec3(b, -a, 0), new Vec3(-b, -a, 0)];
        faces = [new Face3(1, 0, 2), new Face3(2, 3, 1), new Face3(4, 3, 5), new Face3(6, 3, 4), new Face3(7, 0, 8), new Face3(9, 0, 7), new Face3(10, 4, 11), new Face3(11, 7, 10), new Face3(5, 2, 9), new Face3(9, 11, 5), new Face3(8, 1, 6), new Face3(6, 10, 8), new Face3(5, 3, 2), new Face3(1, 3, 6), new Face3(2, 0, 9), new Face3(8, 0, 1), new Face3(9, 7, 11), new Face3(10, 7, 8), new Face3(11, 4, 5), new Face3(6, 4, 10)];
        edges = [new Edge(0, 1), new Edge(0, 2), new Edge(0, 7), new Edge(0, 8), new Edge(0, 9), new Edge(1, 2), new Edge(1, 3), new Edge(1, 6), new Edge(1, 8), new Edge(2, 3), new Edge(2, 5), new Edge(2, 9), new Edge(3, 4), new Edge(3, 5), new Edge(3, 6), new Edge(4, 5), new Edge(4, 6), new Edge(4, 10), new Edge(4, 11), new Edge(5, 9), new Edge(5, 11), new Edge(6, 8), new Edge(6, 10), new Edge(7, 8), new Edge(7, 9), new Edge(7, 10), new Edge(7, 11), new Edge(8, 10), new Edge(9, 11), new Edge(10, 11)];
        Icosahedron.__super__.constructor.call(this, {
          vertices: vertices,
          faces: faces,
          edges: edges
        });
      }

      return Icosahedron;

    })(Geometry);
  });

}).call(this);

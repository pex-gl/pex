(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Edge, FacePolygon, Geometry, HexSphere, Icosahedron, Vec3, hem;
    Vec3 = require('pex/geom/Vec3');
    FacePolygon = require('pex/geom/FacePolygon');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    Icosahedron = require('pex/geom/gen/Icosahedron');
    hem = require('pex/geom/hem');
    return HexSphere = (function(_super) {
      __extends(HexSphere, _super);

      function HexSphere(r, level) {
        var baseGeom, center, faces, he, i, midPoints, p, v, vertex, vertexIndex, vertices, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1;
        if (r == null) {
          r = 1;
        }
        if (level == null) {
          level = 2;
        }
        baseGeom = new Icosahedron(r);
        he = hem().fromGeometry(baseGeom);
        for (i = _i = 0, _ref = level - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          he.subdivideTriangles();
        }
        vertices = [];
        faces = [];
        _ref1 = he.vertices;
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          vertex = _ref1[_j];
          vertexIndex = vertices.length;
          midPoints = [];
          vertex.forEachEdge(function(edge) {
            return midPoints.push(edge.face.getCenter());
          });
          center = new Vec3(0, 0, 0);
          for (_k = 0, _len1 = midPoints.length; _k < _len1; _k++) {
            p = midPoints[_k];
            center.add(p);
          }
          center.scale(1 / midPoints.length);
          vertices = vertices.concat(midPoints);
          if (midPoints.length === 5) {
            faces.push(new FacePolygon([vertexIndex + 4, vertexIndex + 3, vertexIndex + 2, vertexIndex + 1, vertexIndex]));
          }
          if (midPoints.length === 6) {
            faces.push(new FacePolygon([vertexIndex + 5, vertexIndex + 4, vertexIndex + 3, vertexIndex + 2, vertexIndex + 1, vertexIndex]));
          }
        }
        for (_l = 0, _len2 = vertices.length; _l < _len2; _l++) {
          v = vertices[_l];
          v.normalize().scale(r / 2);
        }
        HexSphere.__super__.constructor.call(this, {
          vertices: vertices,
          faces: faces
        });
      }

      return HexSphere;

    })(Geometry);
  });

}).call(this);

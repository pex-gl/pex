(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Face3, Face4, Geometry, Sphere, Vec2, Vec3;
    Vec2 = require('pex/geom/Vec2');
    Vec3 = require('pex/geom/Vec3');
    Face3 = require('pex/geom/Face3');
    Face4 = require('pex/geom/Face4');
    Geometry = require('pex/geom/Geometry');
    return Sphere = (function(_super) {
      __extends(Sphere, _super);

      function Sphere(r, nsides, nsegments) {
        var degToRad, dphi, dtheta, evalPos, normal, numVertices, phi, segment, side, texCoord, theta, vert, vertexIndex, _i, _j;
        if (r == null) {
          r = 0.5;
        }
        if (nsides == null) {
          nsides = 36;
        }
        if (nsegments == null) {
          nsegments = 18;
        }
        numVertices = (nsides + 1) * (nsegments + 1);
        vertexIndex = 0;
        Sphere.__super__.constructor.call(this, {
          vertices: true,
          normals: true,
          texCoords: true,
          faces: true
        });
        degToRad = 1 / 180.0 * Math.PI;
        dtheta = 180.0 / nsegments;
        dphi = 360.0 / nsides;
        evalPos = function(pos, theta, phi) {
          pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
          pos.y = r * Math.cos(theta * degToRad);
          return pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
        };
        theta = 0;
        segment = 0;
        for (segment = _i = 0; 0 <= nsegments ? _i <= nsegments : _i >= nsegments; segment = 0 <= nsegments ? ++_i : --_i) {
          theta = segment * dtheta;
          for (side = _j = 0; 0 <= nsides ? _j <= nsides : _j >= nsides; side = 0 <= nsides ? ++_j : --_j) {
            phi = side * dphi;
            vert = this.vertices[vertexIndex] = Vec3.create();
            normal = this.normals[vertexIndex] = Vec3.create();
            texCoord = this.texCoords[vertexIndex] = Vec2.create();
            evalPos(vert, theta, phi);
            normal.copy(vert).normalize();
            texCoord.set(phi / 360.0, theta / 180.0);
            ++vertexIndex;
            if (segment === nsegments) {
              continue;
            }
            if (side === nsides) {
              continue;
            }
            if (segment < nsegments - 1) {
              this.faces.push(new Face3(segment * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side + 1));
            }
            if (segment > 0) {
              this.faces.push(new Face3(segment * (nsides + 1) + side, (segment + 1) * (nsides + 1) + side + 1, segment * (nsides + 1) + side + 1));
            }
          }
        }
      }

      return Sphere;

    })(Geometry);
  });

}).call(this);

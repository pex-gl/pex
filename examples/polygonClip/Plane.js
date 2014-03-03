(function() {
  define(function(require) {
    var Plane, Vec3;
    Vec3 = require('pex/geom/Vec3');
    return Plane = (function() {
      function Plane(point, normal) {
        this.point = point;
        this.normal = normal;
      }

      Plane.prototype.intersectSegment = function(line) {
        var d, hitPoint, lDotN, plDotN;
        plDotN = Vec3.create().asSub(this.point, line.a).dot(this.normal);
        lDotN = line.direction.dot(this.normal);
        if (Math.abs(lDotN) < 0.001) {
          return null;
        }
        d = plDotN / lDotN;
        hitPoint = Vec3.create().copy(line.direction).scale(d).add(line.a);
        hitPoint.ratio = d / line.a.dup().sub(line.b).length();
        return hitPoint;
      };

      Plane.prototype.isPointAbove = function(p) {
        var pp;
        pp = Vec3.create().asSub(p, this.point).normalize();
        return pp.dot(this.normal) > 0;
      };

      return Plane;

    })();
  });

}).call(this);

(function() {
  define(function(require) {
    var Line2D, Vec2;
    Vec2 = require('pex/geom/Vec2');
    return Line2D = (function() {
      function Line2D(a, b) {
        this.a = a;
        this.b = b;
      }

      Line2D.prototype.isPointOnTheLeftSide = function(p) {
        return ((this.b.x - this.a.x) * (p.y - this.a.y) - (this.b.y - this.a.y) * (p.x - this.a.x)) <= 0;
      };

      Line2D.prototype.projectPoint = function(p) {
        var ab, ap, d;
        ab = Vec2.create().asSub(this.b, this.a).normalize();
        ap = Vec2.create().asSub(p, this.a);
        d = ab.dot(ap);
        return ab.scale(d).add(this.a);
      };

      Line2D.prototype.distanceToPoint = function(p) {
        return this.projectPoint(p).distance(p);
      };

      Line2D.prototype.intersect = function(line) {
        var D0, D1, E, P0, P1, kross, out, s, sqrEpsilon, sqrKross, sqrLen0, sqrLen1, sqrLenE;
        sqrEpsilon = 0.000001;
        P0 = this.a;
        D0 = Vec2.create().asSub(this.b, this.a);
        P1 = line.a;
        D1 = Vec2.create().asSub(line.b, line.a);
        E = Vec2.create().asSub(P1, P0);
        kross = D0.x * D1.y - D0.y * D1.x;
        sqrKross = kross * kross;
        sqrLen0 = D0.x * D0.x + D0.y * D0.y;
        sqrLen1 = D1.x * D1.x + D1.y * D1.y;
        if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
          s = (E.x * D1.y - E.y * D1.x) / kross;
          out = Vec2.create().copy(D0).scale(s).add(P0);
          return out;
        }
        sqrLenE = E.x * E.x + E.y * E.y;
        kross = E.x * D0.y - E.y * D0.x;
        sqrKross = kross * kross;
        if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
          return null;
        }
        return null;
      };

      return Line2D;

    })();
  });

}).call(this);

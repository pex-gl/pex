  define(['pex/geom/Vec2'], function(Vec2) {

  function Line2D(a, b) {
    this.a = a;
    this.b = b;
  }

  Line2D.prototype.isPointOnTheLeftSide = function(p){
    return ((this.b[0] - this.a[0])*(p[1] - this.a[1]) - (this.b[1] - this.a[1])*(p[0] - this.a[0])) <= 0;
  };

  Line2D.prototype.projectPoint = function(out, p) {
    var a = this.a;
    var b = this.b;

    var ab = Vec2.create();
    var ap = Vec2.create();
    Vec2.sub(ab, b, a);
    Vec2.normalize(ab, ab);
    Vec2.sub(ap, p, a);

    //point on line = a + ab * dot(ab, ap)

    var d = Vec2.dot(ab, ap);
    Vec2.scale(out, ab, d);
    Vec2.add(out, out, a);
  };

  Line2D.prototype.distanceToPoint = function(p) {
    var pOnLine = Vec2.create();
    this.projectPoint(pOnLine, p);
    return Vec2.distance(p, pOnLine);
  };

  Line2D.prototype.intersect = function(out, line) {
    var sqrEpsilon = 0.000001;
    var P0 = this.a;
    var D0 = Vec2.create();
    Vec2.sub(D0, this.b, this.a);
    var P1 = line.a;
    var D1 = Vec2.create();
    Vec2.sub(D1, line.b, line.a);

    var E = Vec2.create();
    Vec2.sub(E, P1, P0);

    var kross = D0[0] * D1[1] - D0[1] * D1[0];
    var sqrKross = kross * kross;
    var sqrLen0 = D0[0] * D0[0] + D0[1] * D0[1];
    var sqrLen1 = D1[0] * D1[0] + D1[1] * D1[1];
    if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
      // lines are not parallel
      var s = (E[0] * D1[1] - E[1] *D1[0]) / kross;
      var scaled = Vec2.create();
      Vec2.scale(scaled, D0, s);
      Vec2.copy(out, P0);
      Vec2.add(out, out, scaled);
      return true;
    }
    // lines are parallel
    var sqrLenE = E[0] * E[0] + E[1] * E[1];
    kross = E[0] * D0[1] - E[1] * D0[0];
    sqrKross = kross * kross;
    if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
        // lines are different
        return false;
    }
    return false;
  }

  return Line2D;

})
  define(['pex/geom/Vec2'], function(Vec2) {

  function Line2D(a, b) {
    this.a = a;
    this.b = b;
  }

  Line2D.prototype.isPointOnTheLeftSide = function(p){
    return ((this.b[0] - this.a[0])*(p[1] - this.a[1]) - (this.b[1] - this.a[1])*(p[0] - this.a[0])) <= 0;
  };

  Line2D.prototype.projectPoint = function(p) {
    //var ab = this.b.subbed(this.a).normalize();
    //var ap = p.subbed(this.a);
    //var pOnLine = this.a.added(ab.scale(ab.dot(ap)));
    //return pOnLine;
  };

  Line2D.prototype.distanceToPoint = function(p) {
    //var pOnLine = this.projectPoint(p);
    //return pOnLine.distance(p);
  };

  Line2D.prototype.intersect = function(line) {
    //var sqrEpsilon = 0.000001;
    //var P0 = this.a;
    //var D0 = this.b.subbed(this.a);
    //var P1 = line.a;
    //var D1 = line.b.subbed(line.a);
//
    //var E = P1.subbed(P0);
//
    //var kross = D0.x * D1.y - D0.y * D1.x;
    //var sqrKross = kross * kross;
    //var sqrLen0 = D0.x * D0.x + D0.y * D0.y;
    //var sqrLen1 = D1.x * D1.x + D1.y * D1.y;
    //if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
    //  // lines are not parallel
    //  var s = (E.x * D1.y - E.y *D1.x) / kross;
    //  return P0.added(D0.scaled(s));
    //}
    //// lines are parallel
    //var sqrLenE = E.x * E.x + E.y * E.y;
    //kross = E.x * D0.y - E.y * D0.x;
    //sqrKross = kross * kross;
    //if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
    //    // lines are different
    //    return null;
    //}
    //return null;
  }

  return Line2D;

})
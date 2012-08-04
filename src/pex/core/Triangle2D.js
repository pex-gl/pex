define(["pex/core/Line2D"], function(Line2D) {
  function Triangle2D(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  //Doesn't handle point on the edge
  Triangle2D.prototype.contains = function(p) {
    var ab = new Line2D(this.a, this.b);
    var bc = new Line2D(this.b, this.c);
    var ca = new Line2D(this.c, this.a);
    var isLeftAB = ab.isPointOnTheLeftSide(p);
    var isLeftBC = bc.isPointOnTheLeftSide(p);
    var isLeftCA = ca.isPointOnTheLeftSide(p);
    return (isLeftAB && isLeftBC && isLeftCA) || (!isLeftAB && !isLeftBC && !isLeftCA);
  }

  return Triangle2D;
})



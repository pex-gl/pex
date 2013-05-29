define(['pex/geom/Line2D'], function(Line2D) {
  function sign(a, b, c) {
    return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
  }

  function Triangle2D(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  //http://stackoverflow.com/a/2049593
  //doesn't properly handle points on the edge of the triangle
  Triangle2D.prototype.contains = function(p) {
    var signAB = sign(this.a, this.b, p) < 0;
    var signBC = sign(this.b, this.c, p) < 0;
    var signCA = sign(this.c, this.a, p) < 0;

    return (signAB == signBC) && (signBC == signCA);
  }

  return Triangle2D;
});



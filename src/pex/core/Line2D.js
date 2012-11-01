define([], function() {

  function Line2D(a, b) {
    this.a = a;
    this.b = b;
  }

  //http://stackoverflow.com/questions/3461453/determine-which-side-of-a-line-a-point-lies
  Line2D.prototype.isPointOnTheLeftSide = function(p){
    return ((this.b.x - this.a.x)*(p.y - this.a.y) - (this.b.y - this.a.y)*(p.x - this.a.x)) <= 0;
  }

  Line2D.prototype.projectPoint = function(p) {
    var ab = this.b.subbed(this.a).normalize();
    var ap = p.subbed(this.a);
    var pOnLine = this.a.added(ab.scale(ab.dot(ap)));
    return pOnLine;
  }

  Line2D.prototype.distanceToPoint = function(p) {
    var pOnLine = this.projectPoint(p);
    return pOnLine.distance(p);
  }

  return Line2D;

})
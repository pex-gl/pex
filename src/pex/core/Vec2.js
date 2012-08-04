//2d XY vector.
//
//Usefull for representing 2d points.
define(["plask"], function(plask) {
  plask.Vec2.prototype.distance = function(v) {
    var x = this.x, y = this.y;
    return Math.sqrt((x - v.x)*(x - v.x) + (y - v.y)*(y - v.y));
  }

  plask.Vec2.prototype.distanceSquared = function(v) {
    var x = this.x, y = this.y;
    return ((x - v.x)*(x - v.x) + (y - v.y)*(y - v.y));
  }

  return plask.Vec2;
});
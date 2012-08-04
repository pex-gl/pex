//3d XYZ Vector.
//
//This is just a copy of Vec3 from plask put into Core namespace.
//
//For full reference see [plask](../node/plask.html).
define(["plask"], function(plask) {
  //### crossed ( b )
  //Computes the cross product between *a* and *b* without modifying *a*.
  //
  //`b` - a vector to compute the cross product with *{ Vec3 }*
  //
  //Returns a vector that is perpendicular to the plane defined by *a* and *b* *{ Vec3 }*.
  //
  //*Note: Equivalent of a.dup().cross(b)*.
  plask.Vec3.prototype.crossed = function(b) {
    var c = new plask.Vec3();
    return c.cross2(this, b);
  }

  plask.Vec3.prototype.distance = function(v) {
    var x = this.x, y = this.y, z = this.z;
    return Math.sqrt((x - v.x)*(x - v.x) + (y - v.y)*(y - v.y) + (z - v.z)*(z - v.z));
  }

  plask.Vec3.prototype.distanceSquared = function(v) {
    var x = this.x, y = this.y, z = this.z;
    return ((x - v.x)*(x - v.x) + (y - v.y)*(y - v.y) + (z - v.z)*(z - v.z));
  }

  return plask.Vec3;
});
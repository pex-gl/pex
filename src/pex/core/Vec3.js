define(["plask"], function(plask) {
  plask.Vec3.prototype.crossed = function(b) {
    var c = new plask.Vec3();
    return c.cross2(this, b);
  }
  return plask.Vec3;
});
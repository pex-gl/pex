define(["pex/core/Vec3"], function(Vec3) {
  function BoundingBox(p) {
    this.min = new Vec3(Infinity, Infinity, Infinity);
    this.max = new Vec3(-Infinity,-Infinity,-Infinity);

    if (p !== undefined && p != null) {
      if (p instanceof Array) {
        this.addPoints(p);
      }
      else if (p instanceof Vec3) {
        this.addPoint(p);
      }
    }
  }

  BoundingBox.prototype.addPoints = function(points) {
    for(var i=0; i<points.length; i++) {
      this.addPoint(points[i]);
    }
  }

  BoundingBox.prototype.addPoint = function(p) {
    if (p.x < this.min.x) this.min.x = p.x;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p.x > this.max.x) this.max.x = p.x;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
  }

  BoundingBox.prototype.getSize = function() {
    return this.max.subbed(this.min);
  }

  BoundingBox.prototype.getRadius = function() {
    return this.getSize().scaled(0.5).length();
  }

  return BoundingBox;
});

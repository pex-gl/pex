define(['pex/geom/Vec3'], function(Vec3) {
  function BoundingBox(min, max) {
    this.min = min;
    this.max = max;
  }

  BoundingBox.fromPositionSize = function(pos, size) {
    return new BoundingBox(
      Vec3.fromValues(pos[0] - size[0]/2, pos[1] - size[1]/2, pos[2] - size[2]/2),
      Vec3.fromValues(pos[0] + size[0]/2, pos[1] + size[1]/2, pos[2] + size[2]/2)
    );
  }

  BoundingBox.prototype.getCenter = function(out) {
    if (out) {
      Vec3.set(out,
        (this.min[0] + this.max[0])/2,
        (this.min[1] + this.max[1])/2,
        (this.min[2] + this.max[2])/2
      );
    }
    if (!this.center) {
      this.center = Vec3.fromValues(
        (this.min[0] + this.max[0])/2,
        (this.min[1] + this.max[1])/2,
        (this.min[2] + this.max[2])/2
      );
    }
    return this.center;
  }

  return BoundingBox;
})
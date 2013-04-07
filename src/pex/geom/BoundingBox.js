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

  BoundingBox.fromPoints = function(points) {
    var bbox = new BoundingBox(Vec3.clone(points[0], Vec3.clone(points[0])));
    points.forEach(bbox.addPoint.bind(bbox));
    return bbox;
  }

  BoundingBox.prototype.isEmpty = function() {
    if (!this.min || !this.max) return true;
    else return false;
  }

  BoundingBox.prototype.addPoint = function(p) {
    if (this.isEmpty()) {
      this.min = Vec3.clone(p);
      this.max = Vec3.clone(p);
    }

    if (p[0] < this.min[0]) this.min[0] = p[0];
    if (p[1] < this.min[1]) this.min[1] = p[1];
    if (p[2] < this.min[2]) this.min[2] = p[2];
    if (p[0] > this.max[0]) this.max[0] = p[0];
    if (p[1] > this.max[1]) this.max[1] = p[1];
    if (p[2] > this.max[2]) this.max[2] = p[2];
  }

  BoundingBox.prototype.getSize = function(out) {
    if (!out) {
      if (!this.size) {
        this.size = Vec3.create();
      }
      out = this.size;
    }

    if (this.isEmpty()) {
      Vec3.set(out, 0, 0, 0);
      return out;
    }

    Vec3.set(out,
     (this.max[0] - this.min[0]),
     (this.max[1] - this.min[1]),
     (this.max[2] - this.min[2])
    );
    return out;
  }

  BoundingBox.prototype.getCenter = function(out) {
    if (!out) {
      if (!this.center) {
        this.center = Vec3.create();
      }
      out = this.center;
    }

    Vec3.set(out,
     (this.min[0] + this.max[0])/2,
     (this.min[1] + this.max[1])/2,
     (this.min[2] + this.max[2])/2
    );
    return out;
  }

  return BoundingBox;
})
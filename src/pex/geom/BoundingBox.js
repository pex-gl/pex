define(['pex/geom/Vec3'], function(Vec3) {
  function BoundingBox(min, max) {
    this.min = min;
    this.max = max;
  }

  BoundingBox.fromPositionSize = function(pos, size) {
    return new BoundingBox(
      Vec3.create(pos.x - size.x/2, pos.y - size.y/2, pos.z - size.z/2),
      Vec3.create(pos.x + size.x/2, pos.y + size.y/2, pos.z + size.z/2)
    );
  }

  BoundingBox.fromPoints = function(points) {
    var bbox = new BoundingBox(points[0].clone(), points[0].clone());
    points.forEach(bbox.addPoint.bind(bbox));
    return bbox;
  }

  BoundingBox.prototype.isEmpty = function() {
    if (!this.min || !this.max) return true;
    else return false;
  }

  BoundingBox.prototype.addPoint = function(p) {
    if (this.isEmpty()) {
      this.min = p.clone();
      this.max = p.clone();
    }

    if (p.x < this.min.x) this.min.x = p.x;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p.x > this.max.x) this.max.x = p.x;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
  }

  BoundingBox.prototype.getSize = function() {
    return Vec3.create(
     (this.max.x - this.min.x),
     (this.max.y - this.min.y),
     (this.max.z - this.min.z)
    );
  }

  BoundingBox.prototype.getCenter = function(out) {
    return Vec3.create(
     this.min.x + (this.max.x - this.min.x)/2,
     this.min.y + (this.max.y - this.min.y)/2,
     this.min.z + (this.max.z - this.min.z)/2
    );
  }

  return BoundingBox;
})
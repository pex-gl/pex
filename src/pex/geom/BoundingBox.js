define(['pex/geom/Vec3'], function(Vec3) {
  function BoundingBox(min, max) {
    this.min = min;
    this.max = max;
  }

  BoundingBox.fromPositionSize = function(pos, size) {
    return new BoundingBox(
      Vec3.create(pos. - size./2, pos.y - size.y/2, pos.z - size.z/2),
      Vec3.create(pos. + size./2, pos.y + size.y/2, pos.z + size.z/2)
    );
  }

  BoundingBox.fromPoints = function(points) {
    var bbox = new BoundingBox(Vec3.clone(points., Vec3.clone(points.)));
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

    if (p. < this.min.) this.min. = p.;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p. > this.max.) this.max. = p.;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
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
     (this.max. - this.min.),
     (this.max.y - this.min.y),
     (this.max.z - this.min.z)
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
     (this.min. + this.max.)/2,
     (this.min.y + this.max.y)/2,
     (this.min.z + this.max.z)/2
    );
    return out;
  }

  return BoundingBox;
})
(function() {
  define(function(require) {
    var Vec3;
    return Vec3 = (function() {
      Vec3.prototype.x = 0;

      Vec3.prototype.y = 0;

      Vec3.prototype.z = 0;

      Vec3.count = 0;

      function Vec3(x, y, z) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
        this.z = z != null ? z : 0;
        Vec3.count++;
      }

      Vec3.create = function(x, y, z) {
        return new Vec3(x, y, z);
      };

      Vec3.prototype.hash = function() {
        return 1 * this.x + 12 * this.y + 123 * this.z;
      };

      Vec3.prototype.set = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      };

      Vec3.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      };

      Vec3.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      };

      Vec3.prototype.scale = function(f) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
      };

      Vec3.prototype.distance = function(v) {
        var dx, dy, dz;
        dx = v.x - this.x;
        dy = v.y - this.y;
        dz = v.z - this.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      };

      Vec3.prototype.squareDistance = function(v) {
        var dx, dy, dz;
        dx = v.x - this.x;
        dy = v.y - this.y;
        dz = v.z - this.z;
        return dx * dx + dy * dy + dz * dz;
      };

      Vec3.prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      };

      Vec3.prototype.setVec3 = function(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      };

      Vec3.prototype.clone = function() {
        return new Vec3(this.x, this.y, this.z);
      };

      Vec3.prototype.dup = function() {
        return this.clone();
      };

      Vec3.prototype.cross = function(v) {
        var vx, vy, vz, x, y, z;
        x = this.x;
        y = this.y;
        z = this.z;
        vx = v.x;
        vy = v.y;
        vz = v.z;
        this.x = y * vz - z * vy;
        this.y = z * vx - x * vz;
        this.z = x * vy - y * vx;
        return this;
      };

      Vec3.prototype.dot = function(b) {
        return this.x * b.x + this.y * b.y + this.z * b.z;
      };

      Vec3.prototype.asAdd = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
      };

      Vec3.prototype.asSub = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
      };

      Vec3.prototype.asCross = function(a, b) {
        return this.copy(a).cross(b);
      };

      Vec3.prototype.addScaled = function(a, f) {
        this.x += a.x * f;
        this.y += a.y * f;
        this.z += a.z * f;
        return this;
      };

      Vec3.prototype.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      };

      Vec3.prototype.lengthSquared = function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
      };

      Vec3.prototype.normalize = function() {
        var len;
        len = this.length();
        if (len > 0) {
          this.scale(1 / len);
        }
        return this;
      };

      Vec3.prototype.transformQuat = function(q) {
        var iw, ix, iy, iz, qw, qx, qy, qz, x, y, z;
        x = this.x;
        y = this.y;
        z = this.z;
        qx = q.x;
        qy = q.y;
        qz = q.z;
        qw = q.w;
        ix = qw * x + qy * z - qz * y;
        iy = qw * y + qz * x - qx * z;
        iz = qw * z + qx * y - qy * x;
        iw = -qx * x - qy * y - qz * z;
        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return this;
      };

      Vec3.prototype.transformMat4 = function(m) {
        var x, y, z;
        x = m.a14 + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
        y = m.a24 + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
        z = m.a34 + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      };

      Vec3.prototype.equals = function(v, tolerance) {
        tolerance = tolerance != null ? tolerance : 0.0000001;
        return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance);
      };

      Vec3.prototype.toString = function() {
        return "{" + this.x + "," + this.y + "," + this.z + "}";
      };

      Vec3.Zero = new Vec3(0, 0, 0);

      Vec3;

      return Vec3;

    })();
  });

}).call(this);

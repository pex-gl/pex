(function() {
  define(function(require) {
    var Vec4;
    return Vec4 = (function() {
      Vec4.prototype.x = 0;

      Vec4.prototype.y = 0;

      Vec4.prototype.z = 0;

      Vec4.prototype.w = 0;

      Vec4.count = 0;

      function Vec4(x, y, z, w) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
        this.z = z != null ? z : 0;
        this.w = w != null ? w : 0;
        Vec4.count++;
      }

      Vec4.prototype.equals = function(v, tolerance) {
        if (tolerance == null) {
          tolerance = 0.0000001;
        }
        return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance) && (Math.abs(v.w - this.w) <= tolerance);
      };

      Vec4.prototype.hash = function() {
        return 1 * this.x + 12 * this.y + 123 * this.z + 1234 * this.w;
      };

      Vec4.create = function(x, y, z, w) {
        return new Vec4(x, y, z, w);
      };

      Vec4.prototype.set = function(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
      };

      Vec4.prototype.setVec4 = function(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
      };

      Vec4.prototype.transformMat4 = function(m) {
        var w, x, y, z;
        x = m.a14 * this.w + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
        y = m.a24 * this.w + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
        z = m.a34 * this.w + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
        w = m.a44 * this.w + m.a41 * this.x + m.a42 * this.y + m.a43 * this.z;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
      };

      return Vec4;

    })();
  });

}).call(this);

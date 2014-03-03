(function() {
  define(function(require) {
    var Vec2;
    return Vec2 = (function() {
      Vec2.prototype.x = 0;

      Vec2.prototype.y = 0;

      Vec2.count = 0;

      function Vec2(x, y) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
        Vec2.count++;
      }

      Vec2.create = function(x, y) {
        return new Vec2(x, y);
      };

      Vec2.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
      };

      Vec2.prototype.equals = function(v, tolerance) {
        if (tolerance == null) {
          tolerance = 0.0000001;
        }
        return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance);
      };

      Vec2.prototype.hash = function() {
        return 1 * this.x + 12 * this.y;
      };

      Vec2.prototype.setVec2 = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
      };

      Vec2.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
      };

      Vec2.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
      };

      Vec2.prototype.scale = function(f) {
        this.x *= f;
        this.y *= f;
        return this;
      };

      Vec2.prototype.distance = function(v) {
        var dx, dy;
        dx = v.x - this.x;
        dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
      };

      Vec2.prototype.dot = function(b) {
        return this.x * b.x + this.y * b.y;
      };

      Vec2.prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
      };

      Vec2.prototype.clone = function() {
        return new Vec2(this.x, this.y);
      };

      Vec2.prototype.dup = function() {
        return this.clone();
      };

      Vec2.prototype.asAdd = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
      };

      Vec2.prototype.asSub = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
      };

      Vec2.prototype.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      };

      Vec2.prototype.normalize = function() {
        var len;
        len = this.length();
        if (len > 0) {
          this.scale(1 / len);
        }
        return this;
      };

      Vec2.prototype.toString = function() {
        return "{" + this.x + "," + this.y + "}";
      };

      return Vec2;

    })();
  });

}).call(this);

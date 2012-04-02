//2d XY vector.
//
//Usefull for representing 2d points.
define([], function() {
  function Vec2(x, y) {
    this.x = x;
    this.y = y;
  }

  // Add a Vec2, this = this + b.
  Vec2.prototype.add = function(b) {
    this.x = this.x + b.x;
    this.y = this.y + b.y;
    return this;
  }

  Vec2.prototype.added = function(b) {
    return new Vec2(this.x + b.x,
                    this.y + b.y);
  };

  // Multiply by a scalar.
  Vec2.prototype.scale = function(s) {
    this.x *= s;
    this.y *= s;

    return this;
  };

  Vec2.prototype.scaled = function(s) {
    return new Vec2(this.x * s, this.y * s);
  };

  return Vec2;
});
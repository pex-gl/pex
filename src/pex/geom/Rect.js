define([], function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Rect.prototype.contains = function(point) {
    return (point[0] >= this.x && point[0] <= this.x + this.width && point[1] >= this.y && point[1] <= this.y + this.height);
  }

  return Rect;
});
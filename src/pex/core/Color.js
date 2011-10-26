define(["pex/core/Vec4"], function(Vec4) {
  function Color(r, g, b, a) {
    this.r = (r !== undefined) ? r : 1;
    this.g = (g !== undefined) ? g : 1;
    this.b = (b !== undefined) ? b : 1;
    this.a = (a !== undefined) ? a : 1;
  }

  Color.prototype.toVec4 = function() {
    return new Vec4(this.r, this.g, this.b, this.a);
  }

  Color.prototype.toArray = function() {
    return [this.r, this.g, this.b, this.a];
  }

  Color.Black = new Color(0, 0, 0, 1);
  Color.Grey = new Color(1, 1, 1, 1);
  Color.Grey = new Color(0.5, 0.5, 0.5, 1);
  Color.Red = new Color(1, 0, 0, 1);
  Color.Green = new Color(0, 1, 0, 1);
  Color.Blue = new Color(0, 0, 1, 1);
  Color.Yellow = new Color(1, 1, 0, 1);
  Color.Pink = new Color(1, 0, 1, 1);
  Color.Cyan = new Color(0, 1, 1, 1);

  return Color;
});
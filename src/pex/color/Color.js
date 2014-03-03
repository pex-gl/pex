(function() {
  define(function(require) {
    var Color, MathUtils, clamp;
    MathUtils = require('pex/utils/MathUtils');
    clamp = MathUtils.clamp;
    Color = (function() {
      Color.prototype.r = 0;

      Color.prototype.g = 0;

      Color.prototype.b = 0;

      Color.prototype.a = 0;

      function Color(r, g, b, a) {
        this.r = r != null ? r : 0;
        this.g = g != null ? g : 0;
        this.b = b != null ? b : 0;
        this.a = a != null ? a : 0;
      }

      Color.create = function(r, g, b, a) {
        return new Color(r, g, b, a);
      };

      Color.prototype.set = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        if (a == null) {
          this.a = 1;
        }
        return this;
      };

      Color.prototype.hash = function() {
        return 1 * this.r + 12 * this.g + 123 * this.b + 1234 * this.a;
      };

      Color.prototype.setHSV = function(h, s, v) {
        var b, g, h6, r;
        h6 = h * 6.0;
        r = clamp(h6 - 4.0, 0.0, 1.0) - clamp(h6 - 1.0, 0.0, 1.0) + 1.0;
        g = clamp(h6, 0.0, 1.0) - clamp(h6 - 3.0, 0.0, 1.0);
        b = clamp(h6 - 2.0, 0.0, 1.0) - clamp(h6 - 5.0, 0.0, 1.0);
        this.r = r * v * s + (v * (1.0 - s));
        this.g = g * v * s + (v * (1.0 - s));
        this.b = b * v * s + (v * (1.0 - s));
        return this;
      };

      Color.prototype.copy = function(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
        return this;
      };

      Color.prototype.clone = function(c) {
        return new Color(this.r, this.g, this.b, this.a);
      };

      return Color;

    })();
    Color.Transparent = new Color(0, 0, 0, 0);
    Color.None = new Color(0, 0, 0, 0);
    Color.Black = new Color(0, 0, 0, 1);
    Color.White = new Color(1, 1, 1, 1);
    Color.Grey = new Color(0.5, 0.5, 0.5, 1);
    Color.Red = new Color(1, 0, 0, 1);
    Color.Green = new Color(0, 1, 0, 1);
    Color.Blue = new Color(0, 0, 1, 1);
    Color.Yellow = new Color(1, 1, 0, 1);
    Color.Pink = new Color(1, 0, 1, 1);
    Color.Cyan = new Color(0, 1, 1, 1);
    Color.Orange = new Color(1, 0.5, 0, 1);
    return Color;
  });

}).call(this);

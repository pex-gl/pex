define (require) ->
  MathUtils = require 'pex/utils/MathUtils'
  { clamp } = MathUtils

  #Color class
  class Color
    r: 0
    g: 0
    b: 0
    a: 0

    constructor: (@r=0, @g=0, @b=0, @a=0) ->

    @create: (r, g, b, a) ->
      new Color(r, g, b, a)

    set: (r, g, b, a) ->
      @r = r
      @g = g
      @b = b
      @a = a
      @a = 1 if !a?
      this

    # We basically just make the ramp curves using builtins, see:
    #http://en.wikipedia.org/wiki/File:HSV-RGB-comparison.svg
    setHSV: (h, s, v) ->
      h6 = h * 6.0
      r = clamp(h6 - 4.0, 0.0, 1.0) - clamp(h6 - 1.0, 0.0, 1.0) + 1.0
      g = clamp(h6, 0.0, 1.0) - clamp(h6 - 3.0, 0.0, 1.0)
      b = clamp(h6 - 2.0, 0.0, 1.0) - clamp(h6 - 5.0, 0.0, 1.0)
      #Map from 0 .. 1 to v(1-s) .. v.
      #rgb * (v - (v*(1-s)) + (v*(1-s)) #becomes rgb / (v*s) + (v*(1-s)).
      @r = r * v * s + (v * (1.0 - s))
      @g = g * v * s + (v * (1.0 - s))
      @b = b * v * s + (v * (1.0 - s))
      this

    copy: (c) ->
      @r = c.r
      @g = c.g
      @b = c.b
      @a = c.a
      this

    clone: (c) ->
      new Color(@r, @g, @b, @a)

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

  Color
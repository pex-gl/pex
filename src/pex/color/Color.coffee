define (require) ->
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
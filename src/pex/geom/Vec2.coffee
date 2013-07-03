define (require) ->
  #2D vector class
  class Vec2
    x: 0
    y: 0

    constructor: (@x=0, @y=0) ->

    @create: (x, y) ->
      new Vec2(x, y)

    set: (x, y) ->
      @x = x
      @y = y
      this

    add: (v) ->
      @x += v.x
      @y += v.y
      this

    sub: (v) ->
      @x -= v.x
      @y -= v.y
      this

    scale: (f) ->
      @x *= f
      @y *= f
      this

    distance: (v) ->
      dx = v.x - @x
      dy = v.y - @y
      return Math.sqrt(dx * dx + dy * dy)

    dot: (b) ->
      @x * b.x + @y * b.y

    copy: (v) ->
      @x = v.x
      @y = v.y
      this

    clone: () ->
      new Vec2(@x, @y)

    dup: () ->
      @clone()

    asAdd: (a, b) ->
      @x = a.x + b.x
      @y = a.y + b.y
      this

    asSub: (a, b) ->
      @x = a.x - b.x
      @y = a.y - b.y
      this

    length: () ->
      Math.sqrt(@x*@x + @y*@y)

    normalize: () ->
      @scale(1/@length())
      this

    toString: () ->
      "{#{@x},#{@y}}"
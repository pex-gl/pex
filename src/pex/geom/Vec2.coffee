define (require) ->
  #2D vector class
  class Vec2
    x: 0
    y: 0
    @count: 0

    constructor: (@x=0, @y=0) ->
      Vec2.count++

    @create: (x, y) ->
      new Vec2(x, y)

    set: (x, y) ->
      @x = x
      @y = y
      this

    equals: (v, tolerance=0.0000001) ->
      (Math.abs(v.x - @x) <= tolerance) && (Math.abs(v.y - @y) <= tolerance)

    hash: () ->
      return 1 * @x + 12 * @y

    setVec2: (v) ->
      @x = v.x
      @y = v.y
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
      len = @length()
      if len > 0 then @scale(1/len)
      this

    toString: () ->
      "{#{@x},#{@y}}"
define (require) ->
  #3D vector class
  class Vec4
    x: 0
    y: 0
    z: 0
    w: 0
    @count: 0

    constructor: (@x=0, @y=0, @z=0, @w=0) ->
      Vec4.count++

    equals: (v, tolerance=0.0000001) ->
      (Math.abs(v.x - @x) <= tolerance) && (Math.abs(v.y - @y) <= tolerance) && (Math.abs(v.z - @z) <= tolerance) && (Math.abs(v.w - @w) <= tolerance)

    hash: () ->
      return 1 * @x + 12 * @y + 123 * @z + 1234 * @w

    @create: (x, y, z, w) ->
      new Vec4(x, y, z, w)

    set: (x, y, z, w) ->
      @x = x
      @y = y
      @z = z
      @w = w
      this

    setVec4: (v) ->
      @x = v.x
      @y = v.y
      @z = v.z
      @w = v.w
      this

    transformMat4: (m) ->
      x = m.a14*@w + m.a11*@x + m.a12*@y + m.a13*@z
      y = m.a24*@w + m.a21*@x + m.a22*@y + m.a23*@z
      z = m.a34*@w + m.a31*@x + m.a32*@y + m.a33*@z
      w = m.a44*@w + m.a41*@x + m.a42*@y + m.a43*@z
      @x = x
      @y = y
      @z = z
      @w = w
      this

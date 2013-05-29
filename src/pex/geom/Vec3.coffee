define (require) ->
  #3D vector class
  class Vec3
    x: 0
    y: 0
    z: 0

    constructor: (@x=0, @y=0, @z=0) ->

    @create: (x, y, z) ->
      new Vec3(x, y, z)

    set: (x, y, z) ->
      @x = x
      @y = y
      @z = z
      this

    add: (v) ->
      @x += v.x
      @y += v.y
      @z += v.z
      this

    sub: (v) ->
      @x -= v.x
      @y -= v.y
      @z -= v.z
      this

    scale: (f) ->
      @x *= f
      @y *= f
      @z *= f
      this

    distance: (v) ->
      dx = v.x - @x
      dy = v.y - @y
      dz = v.z - @z
      return Math.sqrt(dx * dx + dy * dy)

    squareDistance: (v) ->
      dx = v.x - @x
      dy = v.y - @y
      dz = v.z - @z
      return dx * dx + dy * dy

    copy: (v) ->
      @x = v.x
      @y = v.y
      @z = v.z
      this

    clone: () ->
      new Vec3(@x, @y, @z)

    dup: () ->
      @clone()

    cross: (v) ->
      x = @x; y = @y; z = @z;
      vx = v.x; vy = v.y; vz = v.z;

      @x = y * vz - z * vy
      @y = z * vx - x * vz
      @z = x * vy - y * vx
      this

    dot: (b) ->
      @x * b.x + @y * b.y + @z * b.z

    asAdd: (a, b) ->
      @x = a.x + b.x
      @y = a.y + b.y
      @z = a.z + b.z
      this

    asSub: (a, b) ->
      @x = a.x - b.x
      @y = a.y - b.y
      @z = a.z - b.z
      this

    asCross: (a, b) ->
      @copy(a).cross(b)

    length: () ->
      Math.sqrt(@x*@x + @y*@y + @z*@z)

    lengthSquared: () ->
      @x*@x + @y*@y + @z*@z

    normalize: () ->
      @scale(1 / @length())
      this

    transformQuat: (q) ->
      x = @x; y = @y; z = @z;
      qx = q.x; qy = q.y; qz = q.z; qw = q.w;

      #calculate quat * vec
      ix = qw * x + qy * z - qz * y
      iy = qw * y + qz * x - qx * z
      iz = qw * z + qx * y - qy * x
      iw = -qx * x - qy * y - qz * z

      @x = ix * qw + iw * -qx + iy * -qz - iz * -qy
      @y = iy * qw + iw * -qy + iz * -qx - ix * -qz
      @z = iz * qw + iw * -qz + ix * -qy - iy * -qx
      this

    transformMat4: (m) ->
      x = m.a14 + m.a11*@x + m.a12*@y + m.a13*@z
      y = m.a24 + m.a21*@x + m.a22*@y + m.a23*@z
      z = m.a34 + m.a31*@x + m.a32*@y + m.a33*@z
      @x = x
      @y = y
      @z = z
      this

    toString: () ->
      "{#{@x},#{@y},#{@z}}"
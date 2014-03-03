define (require) ->
  #3D vector class
  class Vec3
    x: 0
    y: 0
    z: 0
    @count: 0

    constructor: (@x=0, @y=0, @z=0) ->
      Vec3.count++

    @create: (x, y, z) ->
      new Vec3(x, y, z)

    hash: () ->
      return 1 * @x + 12 * @y + 123 * @z

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
      return Math.sqrt(dx * dx + dy * dy + dz * dz)

    squareDistance: (v) ->
      dx = v.x - @x
      dy = v.y - @y
      dz = v.z - @z
      return dx * dx + dy * dy + dz * dz

    copy: (v) ->
      @x = v.x
      @y = v.y
      @z = v.z
      this

    setVec3: (v) ->
      @x = v.x
      @y = v.y
      @z = v.z
      this

    clone: () ->
      new Vec3(@x, @y, @z)

    dup: () ->
      @clone()

    cross: (v) ->
      x = @x
      y = @y
      z = @z

      vx = v.x
      vy = v.y
      vz = v.z

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

    addScaled: (a, f) ->
      @x += a.x * f
      @y += a.y * f
      @z += a.z * f
      this

    length: () ->
      Math.sqrt(@x*@x + @y*@y + @z*@z)

    lengthSquared: () ->
      @x*@x + @y*@y + @z*@z

    normalize: () ->
      len = @length()
      if len > 0 then @scale(1 / len)
      this

    transformQuat: (q) ->
      x = @x
      y = @y
      z = @z
      
      qx = q.x
      qy = q.y
      qz = q.z
      qw = q.w

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

    equals: (v, tolerance) ->
      tolerance = if tolerance? then tolerance else 0.0000001
      (Math.abs(v.x - @x) <= tolerance) && (Math.abs(v.y - @y) <= tolerance) && (Math.abs(v.z - @z) <= tolerance)

    toString: () ->
      "{#{@x},#{@y},#{@z}}"


    Vec3.Zero = new Vec3(0, 0, 0)

    Vec3

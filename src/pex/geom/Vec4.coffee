define (require) ->
  #3D vector class
  class Vec4
    x: 0
    y: 0
    z: 0
    w: 0

    constructor: (@x=0, @y=0, @z=0, @w=0) ->

    @create: (x, y, z, w) ->
      new Vec4(x, y, z, w)
define (require) ->
  Vec3 = require('pex/geom/Vec3')

  class Line3D
    constructor: (@a, @b) ->
      @direction = Vec3.create().asSub(@b, @a).normalize()
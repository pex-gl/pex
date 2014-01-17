define (require) ->
  Vec3 = require('pex/geom/Vec3')

  class Plane
    constructor: (@point, @normal) ->

    #http://en.wikipedia.org/wiki/Line-plane_intersection
    intersectSegment: (line) ->
      plDotN = Vec3.create().asSub(@point, line.a).dot(@normal)
      lDotN = line.direction.dot(@normal)
      if (Math.abs(lDotN) < 0.001)
        return null
      d = plDotN/lDotN
      hitPoint = Vec3.create().copy(line.direction).scale(d).add(line.a)
      hitPoint.ratio = d / line.a.dup().sub(line.b).length()
      hitPoint

    isPointAbove: (p) ->
      pp = Vec3.create().asSub(p, @point).normalize()
      return pp.dot(@normal) > 0

define (require) ->
  Vec2 = require('pex/geom/Vec2')

  class Line2D
    constructor: (@a, @b) ->

    isPointOnTheLeftSide: (p)->
      ((@b.x - @a.x)*(p.y - @a.y) - (@b.y - @a.y)*(p.x - @a.x)) <= 0

    #point on line = a + ab * dot(ab, ap)
    #TODO: overrie the parameter or return new vector (default)?
    projectPoint: (p) ->
      ab = Vec2.create().asSub(@b, @a).normalize()
      ap = Vec2.create().asSub(p, @a)

      d = ab.dot(ap)
      ab.scale(d).add(@a)

    distanceToPoint: (p) ->
      @projectPoint(p).distance(p)

    intersect: (line) ->
      sqrEpsilon = 0.000001
      P0 = @a
      D0 = Vec2.create().asSub(@b, @a)
      P1 = line.a
      D1 = Vec2.create().asSub(line.b, line.a)
      E = Vec2.create().asSub(P1, P0)

      kross = D0.x * D1.y - D0.y * D1.x
      sqrKross = kross * kross
      sqrLen0 = D0.x * D0.x + D0.y * D0.y
      sqrLen1 = D1.x * D1.x + D1.y * D1.y
      if sqrKross > sqrEpsilon * sqrLen0 * sqrLen1
        # lines are not parallel
        s = (E.x * D1.y - E.y *D1.x) / kross
        #var scaled = Vec2.create()
        #Vec2.scale(scaled, D0, s) scaled = D0 * s
        #Vec2.copy(out, P0) out = PO
        #Vec2.add(out, out, scaled) out = out + scaled
        out = Vec2.create().copy(D0).scale(s).add(P0)
        return out

      # lines are parallel
      sqrLenE = E.x * E.x + E.y * E.y
      kross = E.x * D0.y - E.y * D0.x
      sqrKross = kross * kross
      if sqrKross > sqrEpsilon * sqrLen0 * sqrLenE
        # lines are different
        return null

      # lines are the same?
      return null
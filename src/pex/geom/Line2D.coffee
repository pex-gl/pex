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

    #TODO: distanceToPoint creates 3 vectors!!!
    distanceToPoint: (p) ->
      @projectPoint(p).distance(p)

    #intersect: (out, line) ->
    #  var sqrEpsilon = 0.000001;
    #  var P0 = this.a;
    #  var D0 = Vec2.create();
    #  Vec2.sub(D0, this.b, this.a);
    #  var P1 = line.a;
    #  var D1 = Vec2.create();
    #  Vec2.sub(D1, line.b, line.a);
    #
    #  var E = Vec2.create();
    #  Vec2.sub(E, P1, P0);
    #
    #  var kross = D0.x * D1.y - D0.y * D1.x;
    #  var sqrKross = kross * kross;
    #  var sqrLen0 = D0.x * D0.x + D0.y * D0.y;
    #  var sqrLen1 = D1.x * D1.x + D1.y * D1.y;
    #  if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
    #    // lines are not parallel
    #    var s = (E.x * D1.y - E.y *D1.x) / kross;
    #    var scaled = Vec2.create();
    #    Vec2.scale(scaled, D0, s);
    #    Vec2.copy(out, P0);
    #    Vec2.add(out, out, scaled);
    #    return true;
    #  }
    #  // lines are parallel
    #  var sqrLenE = E.x * E.x + E.y * E.y;
    #  kross = E.x * D0.y - E.y * D0.x;
    #  sqrKross = kross * kross;
    #  if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
    #      // lines are different
    #      return false;
    #  }
    #  return false;
    #}
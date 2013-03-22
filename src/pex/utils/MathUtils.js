define(['lib/seedrandom.js', 'pex/geom/Vec2'], function(seedrandom, Vec2) {
  function MathUtils() {
  }

  MathUtils.seed = function(s) {
    Math.seedrandom(s);
  }

  MathUtils.randomVec2InRect = function(rect) {
    return Vec2.fromValues(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
  }

  return MathUtils;
});
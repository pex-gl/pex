define(["pex/core/Vec2", "pex/core/Vec3", "pex/lib/seedrandom"], function(Vec2, Vec3, seedrandom) {
  function RandUtils() {
  }

  //random unit vector on a sphere
  RandUtils.randomVec3 = function() {
    var v = new Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    v.normalize();
    return v;
  }

  RandUtils.randomVec2InRect = function(rect) {
    return new Vec2(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
  }

  RandUtils.seed = function(seed) {
    Math.seedrandom(seed);
  }

  return RandUtils;
});

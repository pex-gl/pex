define(["pex/core/Vec2", "pex/core/Vec3"], function(Vec2, Vec3) {
  var MathUtil = { }

  MathUtil.randomVec3 = function() {
    return new Vec3(
      -1 + 2 * Math.random(),
      -1 + 2 * Math.random(),
      -1 + 2 * Math.random()
    );
  }

  return MathUtil;
});
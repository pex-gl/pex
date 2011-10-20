define(["pex/core/Vec3", "pex/lib/seedrandom"], function(Vec3, seedrandom) {
  function RandUtil() {
  }

  //random unit vector on a sphere
  RandUtil.nextVec3 = function() {
    var v = new Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    v.normalize();
    return v;
  }

  return RandUtil;
});

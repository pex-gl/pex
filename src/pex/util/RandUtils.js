define(["pex/core/Vec3", "pex/lib/seedrandom"], function(Vec3, seedrandom) {
  function RandUtils() {
  }

  //random unit vector on a sphere
  RandUtils.nextVec3 = function() {
    var v = new Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    v.normalize();
    return v;
  }

  RandUtils.seed = function(seed) {
    Math.seedrandom(seed);
  }

  return RandUtils;
});

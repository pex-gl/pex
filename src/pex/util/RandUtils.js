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

  //random unit vector on a sphere
  RandUtils.randomVec3InSphere = function(r) {
    r = r || 1;
    var v = new Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    v.normalize().scale(Math.random() * r);
    return v;
  }

  RandUtils.randomVec3OnSphere = function(r) {
    r = r || 1;
    var v = new Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    v.normalize().scale(r);
    return v;
  }

  RandUtils.randomVec2InRect = function(rect) {
    return new Vec2(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
  }

  RandUtils.randomInt = function(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.floor(min + Math.random() * (max - min));
  }

  RandUtils.randomFloat = function(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  RandUtils.seed = function(seed) {
    Math.seedrandom(seed);
  }

  return RandUtils;
});

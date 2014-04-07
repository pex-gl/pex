define([
  'lib/seedrandom',
  'pex/geom/Vec2',
  'pex/geom/Vec3',
  'pex/geom/Vec4',
  'pex/geom/Mat4',
  'pex/geom/Quat'
], function (seedrandom, Vec2, Vec3, Vec4, Mat4, Quat) {
  function MathUtils() {
  }
  MathUtils.seed = function (s) {
    Math.seedrandom(s);
  };
  MathUtils.randomFloat = function (min, max) {
    if (typeof max == 'undefined') {
      min = 1;
    }
    if (typeof max == 'undefined') {
      max = min;
      min = 0;
    }
    return min + (max - min) * Math.random();
  };
  MathUtils.randomInt = function (min, max) {
    return Math.floor(MathUtils.randomFloat(min, max));
  };
  MathUtils.randomVec3 = function (r) {
    r = r || 0.5;
    var x = 2 * Math.random() - 1;
    var y = 2 * Math.random() - 1;
    var z = 2 * Math.random() - 1;
    return Vec3.create(x * r, y * r, z * r);
  };
  MathUtils.randomVec3InBoundingBox = function (bbox) {
    var x = bbox.min.x + Math.random() * (bbox.max.x - bbox.min.x);
    var y = bbox.min.y + Math.random() * (bbox.max.y - bbox.min.y);
    var z = bbox.min.z + Math.random() * (bbox.max.z - bbox.min.z);
    return Vec3.create(x, y, z);
  };
  MathUtils.randomVec2InRect = function (rect) {
    return Vec2.create(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
  };
  MathUtils.randomChance = function (probability) {
    return Math.random() <= probability;
  };
  MathUtils.randomElement = function (list) {
    return list[Math.floor(Math.random() * list.length)];
  };
  MathUtils.mix = function (a, b, t) {
    return a + (b - a) * t;
  };
  MathUtils.map = function (value, oldMin, oldMax, newMin, newMax) {
    return newMin + (value - oldMin) / (oldMax - oldMin) * (newMax - newMin);
  };
  MathUtils.clamp = function (value, min, max) {
    return Math.max(min, Math.min(value, max));
  };
  var temporaryVec1 = {};
  MathUtils.getTempVec2 = function (name) {
    var result = temporaryVec2[name];
    if (!result) {
      result = temporaryVec2[name] = Vec2.create();
    }
    result.set(0, 0, 0);
    return result;
  };
  var temporaryVec3 = {};
  MathUtils.getTempVec3 = function (name) {
    var result = temporaryVec3[name];
    if (!result) {
      result = temporaryVec3[name] = Vec3.create();
    }
    result.set(0, 0, 0);
    return result;
  };
  var temporaryVec4 = {};
  MathUtils.getTempVec4 = function (name) {
    var result = temporaryVec4[name];
    if (!result) {
      result = temporaryVec4[name] = Vec4.create();
    }
    result.set(0, 0, 0);
    return result;
  };
  var temporaryMat4 = {};
  MathUtils.getTempMat4 = function (name) {
    var result = temporaryMat4[name];
    if (!result) {
      result = temporaryMat4[name] = Mat4.create();
    }
    result.identity();
    return result;
  };
  var temporaryQuat = {};
  MathUtils.getTempQuat = function (name) {
    var result = temporaryQuat[name];
    if (!result) {
      result = temporaryQuat[name] = Quat.create();
    }
    result.identity();
    return result;
  };
  return MathUtils;
});
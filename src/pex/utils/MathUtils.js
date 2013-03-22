define(['lib/seedrandom.js'], function(seedrandom) {
  function MathUtils() {
  }

  MathUtils.seed = function(s) {
    Math.randomseed(s);
  }

  return MathUtils;
});
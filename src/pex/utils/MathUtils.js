define(['lib/seedrandom.js'], function(seedrandom) {
  function MathUtils() {
  }

  MathUtils.seed = function(s) {
    Math.seedrandom(s);
  }
  }

  return MathUtils;
});
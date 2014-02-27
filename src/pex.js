(function() {
  define(function(require) {
    var color, fx, geom, gl, gui, materials, scene, sys, utils;
    geom = require('pex/geom');
    utils = require('pex/utils');
    sys = require('pex/sys');
    gl = require('pex/gl');
    materials = require('pex/materials');
    scene = require('pex/scene');
    fx = require('pex/fx');
    gui = require('pex/gui');
    color = require('pex/color');
    return {
      geom: geom,
      utils: utils,
      sys: sys,
      gl: gl,
      materials: materials,
      scene: scene,
      fx: fx,
      require: sys.Require,
      gui: gui,
      color: color
    };
  });

}).call(this);

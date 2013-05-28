//Module wrapper for the whole Pex library.
define(function(require) {
  var geom = require('pex/geom');
  var utils = require('pex/utils');
  var sys = require('pex/sys');
  var gl = require('pex/gl');
  var materials = require('pex/materials');
  var scene = require('pex/scene');
  var fx = require('pex/fx');
  var gui = require('pex/gui');
  var test = require('pex/test/test');

  return {
    geom : geom,
    utils : utils,
    sys : sys,
    gl : gl,
    materials : materials,
    scene : scene,
    fx : fx,
    require : sys.Require, //shortcut,
    gui : gui
  };
});

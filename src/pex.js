//Module wrapper for the whole Pex library.
define(
  [
    'pex/geom',
    'pex/utils',
    'pex/sys',
    'pex/gl',
    'pex/materials',
    'pex/scene',
    'pex/fx',
    'pex/gui'
  ],
  function(geom, utils, sys, gl, materials, scene, fx, gui) {
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
  }
)
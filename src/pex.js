//Module wrapper for the whole Pex library.
define(
  [
    'pex/geom',
    'pex/utils',
    'pex/sys',
    'pex/gl',
    'pex/materials',
    'pex/scene'
  ],
  function(geom, utils, sys, gl, materials, scene) {
    return {
      geom : geom,
      utils : utils,
      sys : sys,
      gl : gl,
      materials : materials,
      scene : scene,
      require : sys.Require //shortcut
    };
  }
)
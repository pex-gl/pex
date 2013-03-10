//Module wrapper for the whole Pex library.
define(
  [
    'pex/geom',
    'pex/utils',
    'pex/sys',
    'pex/gl',
    'pex/materials',
  ],
  function(geom, utils, sys, gl, materials) {
    return {
      geom : geom,
      utils : utils,
      sys : sys,
      gl : gl,
      materials : materials,
      require : sys.Require //shortcut
    };
  }
)
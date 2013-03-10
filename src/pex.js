//Module wrapper for the whole Pex library.
define(
  [
    "pex/geom",
    "pex/utils",
    "pex/sys",
    "pex/gl",
  ],
  function(geom, utils, sys, gl) {
    return {
      geom : geom,
      utils : utils,
      sys : sys,
      gl : gl,
      require : sys.Require //shortcut
    };
  }
)
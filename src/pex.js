//Module wrapper for the whole Pex library.
define(
  [
    "pex/geom",
    "pex/utils",
    "pex/sys",
  ],
  function(geom, utils, sys) {
    return {
      geom : geom,
      utils : utils,
      sys : sys,
      require : sys.Require //shortcut
    };
  }
)
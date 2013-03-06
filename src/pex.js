//Module wrapper for the whole Pex library.
define(
  [
    "pex/utils",
    "pex/sys"
  ],
  function(utils, sys) {
    return {
      utils : utils,
      sys : sys,
      require : sys.Require //shortcut
    };
  }
)
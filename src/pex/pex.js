//Module wrapper for the whole Pex library.
define("pex/Pex", [
    "pex/cameras/Cameras",
    "pex/core/Core",
    "pex/geom/Geom",
    "pex/gui/GUI",
    "pex/materials/Materials",
    "pex/sys/Sys",
    "pex/util/Util",
  ],
  function(Cameras, Core, Geom, GUI, Materials, Sys, Util) {
    var Pex = {
      Cameras : Cameras,
      Core : Core,
      Geom : Geom,
      GUI : GUI,
      Materials : Materials,
      Sys : Sys,
      Util : Util
    }
    return Pex;
  }
)
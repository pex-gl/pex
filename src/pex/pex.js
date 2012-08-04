//Module wrapper for the whole Pex library.
define("pex/Pex", [
    "pex/behaviors/Behaviors",
    "pex/cameras/Cameras",
    "pex/core/Core",
    "pex/geom/Geom",
    "pex/gui/GUI",
    "pex/materials/Materials",
    "pex/sys/Sys",
    "pex/util/Util",
  ],
  function(Behaviors, Cameras, Core, Geom, GUI, Materials, Sys, Util) {
    var Pex = {
      Behaviors : Behaviors,
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
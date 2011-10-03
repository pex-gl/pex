define('pex/Pex',[
    "pex/cameras/Cameras",
    "pex/core/Core",
    "pex/geom/Geom",
    "pex/materials/Materials",
    "pex/sys/Sys",
    "pex/util/Util",
  ],
  function(Cameras, Core, Geom, Materials, Sys, Util) {
    var Pex = {
      Cameras : Cameras,
      Core : Core,
      Geom : Geom,
      Materials : Materials,
      Sys : Sys,
      Util : Util
    }
  }
)
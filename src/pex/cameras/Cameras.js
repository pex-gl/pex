//Module wrapper for camera related classes.
define([
  "pex/cameras/Arcball",
  "pex/cameras/PerspectiveCamera"
  ], function(Arcball, PerspectiveCamera) {
    return {
      Arcball : Arcball,
      PerspectiveCamera : PerspectiveCamera
    }
  }
);
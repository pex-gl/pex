define([
  "pex/cameras/Arcball",
  "pex/cameras/PerspectiveCamera"
  ], function(Arcball, PerspectiveCamera) {
    var Cameras = {
      Arcball : Arcball,
      PerspectiveCamera : PerspectiveCamera
    }

    return Cameras;
  }
);
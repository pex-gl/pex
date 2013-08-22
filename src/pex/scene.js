define(
  [
    'pex/scene/PerspectiveCamera',
    'pex/scene/Arcball',
    'pex/scene/Scene'
  ],
  function(PerspectiveCamera, Arcball, Scene) {
    return {
      PerspectiveCamera : PerspectiveCamera,
      Arcball : Arcball,
      Scene : Scene
    };
  }
);

define(
  [
    'pex/scene/PerspectiveCamera',
    'pex/scene/OrthographicCamera',
    'pex/scene/Arcball',
    'pex/scene/Scene'
  ],
  function(PerspectiveCamera, OrthographicCamera, Arcball, Scene) {
    return {
      PerspectiveCamera : PerspectiveCamera,
      OrthographicCamera : OrthographicCamera,
      Arcball : Arcball,
      Scene : Scene
    };
  }
);

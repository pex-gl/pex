define(
  [
    'pex/geom/gen/Cube',
    'pex/geom/gen/Sphere',
    'pex/geom/gen/LineBuilder'
  ],
  function(Cube, Sphere, LineBuilder) {
    return {
      Cube : Cube,
      Sphere : Sphere,
      LineBuilder : LineBuilder
    };
  }
);

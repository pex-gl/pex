define( [
  "pex/geom/Cube",
  "pex/geom/SimpleCube",
  "pex/geom/Sphere",
  "pex/geom/LineBuilder"
  ],
  function(Cube, SimpleCube, Sphere, LineBuilder) {
    return {
      Cube : Cube,
      SimpleCube : SimpleCube,
      Sphere : Sphere,
      LineBuilder : LineBuilder
    };
});
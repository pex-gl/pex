define( [
  "pex/geom/Geometry",
  "pex/geom/Cube",
  "pex/geom/SimpleCube",
  "pex/geom/Sphere",
  "pex/geom/LineBuilder"
  ],
  function(Geometry, Cube, SimpleCube, Sphere, LineBuilder) {
    return {
      Geometry : Geometry,
      Cube : Cube,
      SimpleCube : SimpleCube,
      Sphere : Sphere,
      LineBuilder : LineBuilder
    };
});
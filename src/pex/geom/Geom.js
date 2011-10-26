define( [
  "pex/geom/Geometry",
  "pex/geom/Cube",
  "pex/geom/SimpleCube",
  "pex/geom/Sphere",
  "pex/geom/LineBuilder",
  "pex/geom/Spline",
  "pex/geom/Loft"
  ],
  function(Geometry, Cube, SimpleCube, Sphere, LineBuilder, Spline, Loft) {
    return {
      Geometry : Geometry,
      Cube : Cube,
      SimpleCube : SimpleCube,
      Sphere : Sphere,
      LineBuilder : LineBuilder,
      Spline : Spline,
      Loft : Loft
    };
});
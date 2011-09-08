define( [ 
  "pex/geom/Cube",
  "pex/geom/SimpleCube",
  "pex/geom/Sphere" ], 
  function(Cube, SimpleCube, Sphere) {    
    return {
      Cube : Cube,
      SimpleCube : SimpleCube,
      Sphere : Sphere
    };
});
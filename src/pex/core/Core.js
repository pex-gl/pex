define( [ 
  "pex/core/Vec2",
  "pex/core/Vec3", 
  "pex/core/Vec4", 
  "pex/core/Mat3", 
  "pex/core/Mat4", 
  "pex/core/Face3", 
  "pex/core/Face4",
  "pex/core/Ray",
  "pex/core/Program",
  "pex/core/Vbo" ], 
  function(Vec2, Vec3, Vec4, Mat3, Mat4, Face3, Face4, Ray, Program, Vbo) {    
    return {
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat3 : Mat3,
      Mat4 : Mat4,
      Face3 : Face3,
      Face4 : Face4,    
      Ray : Ray,
      Program : Program,
      Vbo : Vbo
    };
});
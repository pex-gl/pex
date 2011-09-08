define( [ 
  "plask", 
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
  function(plask, Vec2, Vec3, Vec4, Mat3, Mat4, Face3, Face4, Ray, Program, Vbo) {    
    function Core() {    
    }
  
    Core.Vec2 = Vec2;
    Core.Vec3 = Vec3;
    Core.Vec4 = Vec4;
    Core.Mat3 = Mat3;
    Core.Mat4 = Mat4;
    Core.Face3 = Face3;
    Core.Face4 = Face4;    
    Core.Ray = Ray;
    Core.Program = Program;
    Core.Vbo = Vbo;
    
    return Core;
});
//Module wrapper for the core classes.
define( [
  "pex/core/Context",
  "pex/core/Vec2",
  "pex/core/Vec3",
  "pex/core/Vec4",
  "pex/core/Mat4",
  "pex/core/Quat",
  "pex/core/Edge",
  "pex/core/Face3",
  "pex/core/Face4",
  "pex/core/Ray",
  "pex/core/Vbo",
  "pex/core/Mesh",
  "pex/core/Program",
  "pex/core/Material",
  "pex/core/Texture2D",
  "pex/core/TextureCube",
  "pex/core/Fbo",
  "pex/core/Geometry",    
  "pex/core/Spline",  
  ],
  function(
      Context, Vec2, Vec3, Vec4, Mat4, Quat, Edge, Face3, Face4, 
      Ray, Vbo, Mesh, Program, Material, Texture2D, TextureCube, 
      Fbo, Geometry, Spline
    ) {
    return {
      Context : Context,
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat4 : Mat4,
      Quat : Quat,
      Edge : Edge,
      Face3 : Face3,
      Face4 : Face4,
      Ray : Ray,
      Vbo : Vbo,
      Mesh : Mesh,
      Program : Program,
      Material : Material,
      Texture2D : Texture2D,
      TextureCube: TextureCube,
      Fbo : Fbo,
      Geometry : Geometry,
      Spline : Spline
    };
});
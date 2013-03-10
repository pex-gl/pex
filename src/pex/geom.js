define(
  [
    'lib/gl-matrix',
    'pex/geom/Geometry',
    'pex/geom/gen'
  ],
  function(glmatrix, Geometry, gen) {
    return {
      Vec2 : glmatrix.vec2,
      Vec3 : glmatrix.vec4,
      Vec4 : glmatrix.vec4,
      Mat2 : glmatrix.mat2,
      Mat3 : glmatrix.mat3,
      Mat4 : glmatrix.mat4,
      Quat : glmatrix.quat,
      Geometry : Geometry,
      gen : gen
    };
  }
);

define(
  [
    'pex/geom/Vec2',
    'pex/geom/Vec3',
    'pex/geom/Vec4',
    'pex/geom/Mat3',
    'pex/geom/Mat4',
    'pex/geom/Quat',
    'pex/geom/Geometry',
    'pex/geom/gen'
  ],
  function(Vec2, Vec3, Vec4, Mat3, Mat4, Quat, Geometry, gen) {
    return {
      Vec2 : Vec2,
      Vec3 : Vec4,
      Vec4 : Vec4,
      Mat3 : Mat3,
      Mat4 : Mat4,
      Quat : Quat,
      Geometry : Geometry,
      gen : gen
    };
  }
);



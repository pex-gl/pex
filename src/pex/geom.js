define(
  [
    'pex/geom/Vec2',
    'pex/geom/Vec3',
    'pex/geom/Vec4',
    'pex/geom/Mat3',
    'pex/geom/Mat4',
    'pex/geom/Quat',
    'pex/geom/Geometry',
    'pex/geom/gen',
    'pex/geom/Face3',
    'pex/geom/Face4',
    'pex/geom/FacePolygon',
    'pex/geom/Vec2Array',
    'pex/geom/Vec3Array',
    'pex/geom/Vec4Array',
    'pex/geom/Line2D',
    'pex/geom/Rect',
    'pex/geom/Triangle2D',
    'pex/geom/Polygon2D',
    'pex/geom/hem',
    'pex/geom/BoundingBox',
    'pex/geom/Octree',
  ],
  function(Vec2, Vec3, Vec4, Mat3, Mat4, Quat, Geometry, gen,
    Face3, Face4, FacePolygon, Vec2Array, Vec3Array, Vec4Array, Line2D, Rect, Triangle2D, Polygon2D, hem, 
    BoundingBox, Octree) {
    return {
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat3 : Mat3,
      Mat4 : Mat4,
      Quat : Quat,
      Geometry : Geometry,
      gen : gen,
      Face3 : Face3,
      Face4 : Face4,
      FacePolygon : FacePolygon,
      Vec2Array : Vec2Array,
      Vec3Array : Vec3Array,
      Vec4Array : Vec4Array,
      Line2D : Line2D,
      Rect : Rect,
      Triangle2D : Triangle2D,
      Polygon2D : Polygon2D,
      hem : hem,
      BoundingBox : BoundingBox,
      Octree : Octree
    };
  }
);



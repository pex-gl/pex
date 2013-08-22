define(
  [
    'pex/geom/Vec2',
    'pex/geom/Vec3',
    'pex/geom/Vec4',
    'pex/geom/Mat4',
    'pex/geom/Quat',
    'pex/geom/Geometry',
    'pex/geom/gen',
    'pex/geom/Edge',
    'pex/geom/Face3',
    'pex/geom/Face4',
    'pex/geom/FacePolygon',
    'pex/geom/Line2D',
    'pex/geom/Rect',
    'pex/geom/Triangle2D',
    'pex/geom/Polygon2D',
    'pex/geom/hem',
    'pex/geom/BoundingBox',
    'pex/geom/Octree',
    'pex/geom/Spline3D',
    'pex/geom/Ray'
  ],
  function(Vec2, Vec3, Vec4, Mat4, Quat, Geometry, gen,
    Edge, Face3, Face4, FacePolygon, Line2D, Rect, Triangle2D, Polygon2D, hem, 
    BoundingBox, Octree, Spline3D, Ray) {
    return {
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat4 : Mat4,
      Quat : Quat,
      Geometry : Geometry,
      gen : gen,
      Edge : Edge,
      Face3 : Face3,
      Face4 : Face4,
      FacePolygon : FacePolygon,
      Line2D : Line2D,
      Rect : Rect,
      Triangle2D : Triangle2D,
      Polygon2D : Polygon2D,
      hem : hem,
      BoundingBox : BoundingBox,
      Octree : Octree,
      Spline3D: Spline3D,
      Ray : Ray
    };
  }
);



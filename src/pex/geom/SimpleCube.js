define(["pex/core/Vec3", "pex/core/Face3", "pex/geom/Geometry"], function(Vec3, Face3, Geometry) {
  function SimpleCube(size) {
    size = size || 1;
    var s = size/2;
    this.vertices = [
      new Vec3(-s,  s,  s), //FTL 0           0--1
      new Vec3( s,  s,  s), //FTR 1           | /|
      new Vec3( s, -s,  s), //FBR 2           3--2
      new Vec3(-s, -s,  s), //FBL 3
      new Vec3(-s,  s, -s), //BTL 4           4--5
      new Vec3( s,  s, -s), //BTR 5           | \|
      new Vec3( s, -s, -s), //BBR 6           7--6
      new Vec3(-s, -s, -s)  //BBL 7
    ];

    this.faces = [
      new Face3(0, 3, 1), //Front
      new Face3(1, 3, 2),
      new Face3(5, 6, 4), //Back
      new Face3(4, 6, 7),
      new Face3(4, 7, 0), //Left
      new Face3(0, 7, 3),
      new Face3(1, 2, 5), //Right
      new Face3(5, 2, 6),
      new Face3(4, 0, 5), //Top
      new Face3(5, 0, 1),
      new Face3(3, 7, 2), //Bottom
      new Face3(2, 7, 6)
    ];
  }

  SimpleCube.prototype = new Geometry();

  return SimpleCube;
});

//Triangle face used for building geometry.

//## Example use
//     var geom = new Geometry();
//     geom.vertices = [
//       new Vec3(0, 1, 0),
//       new Vec3(0, 0, 0),
//       new Vec3(1, 1, 0)
//     ];
//     geom.faces = [
//       new Face3(0, 1, 2)
//     ];
//     var material = new Materials.SolidColorMaterial();
//     var mesh = new Mesh(geom, material);

//## Reference
define([], function() {

  //### Face3 (a, b, c)
  //`a` - index of the first vertex *{ Number/Int }*  
  //`b` - index of the second vertex *{ Number/Int }*  
  //`c` - index of the third vertex *{ Number/Int }*
  //
  //For WebGL the face to be front facing it has to be in CCW order.
  //
  //     a-----c
  //     |   /
  //     | /
  //     b
  //
  function Face3(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
  return Face3;
});
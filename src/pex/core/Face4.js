//Triangle face used for building geometry.

//## Example use
//     var geom = new Geometry();
//     geom.vertices = [
//       new Vec3(0, 1, 0),
//       new Vec3(0, 0, 0),
//       new Vec3(1, 0, 0),
//       new Vec3(1, 1, 0)
//     ];
//     geom.faces = [
//       new Face4(0, 1, 2, 3)
//     ];
//     var material = new Materials.SolidColorMaterial();
//     var mesh = new Mesh(geom, material);

//## Reference
define([], function() {

  //### Face4 (a, b, c, d)
  //`a` - index of the first vertex *{ Number/Int }*  
  //`b` - index of the second vertex *{ Number/Int }*  
  //`c` - index of the third vertex *{ Number/Int }*  
  //`d` - index of the fourth vertex *{ Number/Int }*
  //
  //For WebGL the face to be front facing it has to be in CCW order.
  //
  //     a-----d
  //     |   . |
  //     | .   |
  //     b-----c  
  //
  function Face4(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  return Face4;
});
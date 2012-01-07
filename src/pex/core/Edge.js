//Edge connecting two vertices in a geometry.

//## Example use
//     var geom = new Geometry();
//     geom.vertices = [
//       new Vec3(0, 0, 0),
//       new Vec3(1, 0, 0)
//     ];
//     geom.edges = [
//       new Edge(0, 1)
//     ];
//     var material = new Materials.SolidColorMaterial();
//     var mesh = new Mesh(geom, material, { useEdges : true });

//## Reference
define([], function() {

  //### Edge (a, b)
  //`a` - index of the first vertex *{ Number/Int }*  
  //`b` - index of the second vertex *{ Number/Int }*
  function Edge(a, b) {
    this.a = a;
    this.b = b;
  }
  return Edge;
});
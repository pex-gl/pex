define(["pex/core/Vec3"], function(Vec3) {
  function HEVertex(x, y, z, edge) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.edge = edge;
    this.selected = 0;
  }

  HEVertex.prototype = new Vec3();

  HEVertex.prototype.getNormal = function() {
    var faces = [];

    var edge = this.edge;
    do {
      faces.push(edge.face);
      edge = edge.pair.next;
    } while (edge != this.edge);

    var n = new Vec3(0, 0, 0);
    for(var i in faces) {
      n.add(faces[i].getNormal());
    }
    n.normalize();

    return n;
  }

  return HEVertex;
});

define(['pex/geom/Vec3'], function(Vec3) {
  function HEFace(edge) {
    this.edge = edge;
    this.selected = 0;
    this.normal = null;
  }

  HEFace.prototype.getNormal = function() {
    if (!this.normal) {
      this.normal = Vec3.create();
    }
    var a = this.edge.vert.position;
    var b = this.edge.next.vert.position;
    var c = this.edge.next.next.vert.position;
    var ab = HEFace.prototype.getNormal.ab = HEFace.prototype.getNormal.ab || Vec3.create();
    var ac = HEFace.prototype.getNormal.ac = HEFace.prototype.getNormal.ac || Vec3.create();

    ab.asSub(b, a);
    ac.asSub(c, a);
    this.normal.asCross(ab, ac).normalize();

    return this.normal;
  }

  //calculates the centroid of the face
  HEFace.prototype.getCenter = function() {
    if (!this.center) {
      this.center = Vec3.create();
    }
    this.center.set(0, 0, 0);
    var vertexCount = 0;
    var edge = this.edge;
    do {
      this.center.add(edge.vert.position);
      vertexCount++;
      edge = edge.next;
    } while (edge != this.edge);

    this.center.scale(1/vertexCount);
    return this.center;
  }

  HEFace.prototype.getAllVertices = function() {
    var vertices = [];
    var edge = this.edge;
    do {
      vertices.push(edge.vert);
      edge = edge.next;
    } while (edge != this.edge);
    return vertices;
  }

  HEFace.prototype.edgePairLoop = function(callback) {
    var edge = this.edge;
    do {
      callback(edge, edge.next);
      edge = edge.next;
    } while(edge != this.edge);

  }

  return HEFace;
});

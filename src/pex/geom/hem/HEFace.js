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

    Vec3.sub(ab, b, a);
    Vec3.sub(ac, c, a);
    Vec3.cross(this.normal, ab, ac);
    Vec3.normalize(this.normal, this.normal);

    return this.normal;
  }

  //calculates the centroid of the face
  HEFace.prototype.getCenter = function() {
    var vertexCount = 0;
    var center = new Vec3(0, 0, 0);
    var edge = this.edge;
    do {
      center.add(edge.vert);
      vertexCount++;
      edge = edge.next;
    } while (edge != this.edge);

    center.scale(1/vertexCount);
    return center;
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

define([
  "pex/geom/hem/HEMesh",
  "pex/geom/hem/HEVertex",
  "pex/geom/hem/HEEdge",
  "pex/geom/hem/HEFace",
  "pex/geom/Vec3"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HESubdivideTriangles() {
  }

  HEMesh.prototype.subdivideTriangles = function() {
    this.clearMarking();
    //keep these numbers to iterate only over original faces/edges/vertices
    var numFaces = this.faces.length;
    var numEdges = this.edges.length;
    var numVertices = this.vertices.length;
    var i;
    var edge;
    var edgePoint;

    //For each edge, add an edge point - the average of
    //its two original endpoints.
    for(i=0; i<numEdges; i++) {
      edge = this.edges[i];
      if (edge.marked) continue;
      edge.marked = true;
      edge.pair.marked = true;
      this.splitEdge(edge, 0.5);
    }

    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];

      var edge1 = face.edge;
      var edge2 = edge1.next.next;
      var edge3 = edge2.next.next;
      this.splitFace(edge1.next, edge3.next);
      edge2 = edge1.next.pair.next;
      this.splitFace(edge2, edge2.next.next);
      edge3 = edge2.next.next.pair.next;
      this.splitFace(edge3, edge3.next.next);
    }

    this.clearMarking();

    return this;
  };

  return HESubdivideTriangles;
});

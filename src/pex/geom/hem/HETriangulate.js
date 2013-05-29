define([
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HETriangulate() {
  }

  HEMesh.prototype.triangulate = function() {
    var numFaces = this.faces.length;


    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];
      var vertices = face.getAllVertices();

      while(vertices.length > 3) {
        var firstEdge = face.edge;
        face = this.splitFace(firstEdge, firstEdge.next.next);
        vertices = face.getAllVertices();
      }
    }

    return this;
  };

  return HETriangulate;
});

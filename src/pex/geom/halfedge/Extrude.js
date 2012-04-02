define(["HEMesh", "HEVertex", "HEEdge", "HEFace", "pex/core/Vec3"], function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {
  function Extrude() {
  }

  Extrude.prototype.apply = function(hemesh, height, selection) {
    var numFaces = hemesh.faces.length;
    for(var f=0; f<numFaces; f++) {
      var face = hemesh.faces[f];

      if (selection && selection.length > 0 && selection.indexOf(face) == -1) continue;

      var normal = face.getNormal();
      var edge = face.edge;
      var newVertices = [];
      var newFaces = [];
      var newEdges = [];

      do {
        var newPoint = edge.vert.dup().add(normal.scaled(height));
        var newVertex = new HEVertex(newPoint.x, newPoint.y, newPoint.z);
        newVertices.push(newVertex);
        hemesh.vertices.push(newVertex);

        var newFace = new HEFace();
        newFaces.push(newFace);
        hemesh.faces.push(newFace);

        for(var j=0; j<3; j++) {
          var newEdge = new HEEdge();
          newEdges.push(newEdge);
          hemesh.edges.push(newEdge);
        }
        edge = edge.next;
      } while (edge != face.edge);

      edge = face.edge;
      for(var i=0; i<newFaces.length; i++) {
        var oldNext = edge.next;

        newEdges[3*i+0].vert = oldNext.vert;
        newEdges[3*i+1].vert = newVertices[(i+1)%newVertices.length];
        newEdges[3*i+2].vert = newVertices[i];

        edge.vert.edge = edge;
        newEdges[3*i+0].vert.edge = newEdges[3*i+0];
        newEdges[3*i+1].vert.edge = newEdges[3*i+1];
        newEdges[3*i+2].vert.edge = newEdges[3*i+2];

        edge.next = newEdges[3*i+0];
        newEdges[3*i+0].next = newEdges[3*i+1];
        newEdges[3*i+1].next = newEdges[3*i+2];
        newEdges[3*i+2].next = edge;

        edge.face = newFaces[i];
        newEdges[3*i+0].face = newFaces[i];
        newEdges[3*i+1].face = newFaces[i];
        newEdges[3*i+2].face = newFaces[i];

        newFaces[i].edge = edge;

        edge = oldNext;
      }

      var topEdges = [];
      for(var i=0; i<newVertices.length; i++) {
        var newEdge = new HEEdge();
        topEdges.push(newEdge);
        hemesh.edges.push(newEdge);
      }

      for(var i=0; i<newVertices.length; i++) {
        topEdges[i].next = topEdges[(i+1)%topEdges.length];
        topEdges[i].vert = newVertices[i];
        topEdges[i].face = face;
      }
      face.edge = topEdges[0];
    }
    console.log("end!");
    hemesh.check();
    hemesh.assignEdgePairs();
    return hemesh;
  }

  return Extrude;
});

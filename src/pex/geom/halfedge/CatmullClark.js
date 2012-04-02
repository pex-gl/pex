//Catmull-Clark subdivision for half-edge meshes
//Based on http://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface
//Modified to follow Doo-Sabin scheme for new vertices 1/n*F + 1/n*R + (n-2)/n*v
//http://www.cse.ohio-state.edu/~tamaldey/course/784/note20.pdf
define(["HEMesh", "HEVertex", "HEEdge", "HEFace", "pex/core/Vec3"], function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {
  function CatmullClark() {
  }

  CatmullClark.prototype.apply = function(hemesh) {
    var numVertices = hemesh.vertices.length;
    var newEdges = [];
    var newFaces = [];

    for(var i in hemesh.faces) {
      var face = hemesh.faces[i];
      var center = face.getCenter();
      var facePoint = new HEVertex(center.x, center.y, center.z);
      face.facePoint = facePoint;
      hemesh.vertices.push(facePoint);
    }

    for(var i in hemesh.edges) {
      var edge = hemesh.edges[i];
      if (edge.edgePoint != null) continue;
      var edgePoint = new HEVertex(0, 0, 0);
      edgePoint.add(edge.vert);
      edgePoint.add(edge.next.vert);
      edgePoint.add(edge.face.facePoint);
      edgePoint.add(edge.pair.face.facePoint);
      edgePoint.scale(1/4);
      edge.edgePoint = edgePoint;
      edge.pair.edgePoint = edge.edgePoint;
      hemesh.vertices.push(edgePoint);
    }

    for(var i=0; i<numVertices; i++) {
      var vertex = hemesh.vertices[i];
      var faceEdge = vertex.edge;
      var face = faceEdge.face;
      var F = new Vec3(0, 0, 0); //average facePoint of neighbor faces
      var R = new Vec3(0, 0, 0); //average edgePoint of neighbor edges
      var n = 0; //num faces/edges
      do {
        F.add(face.facePoint);
        R.add(faceEdge.edgePoint);
        ++n
        faceEdge = faceEdge.pair.next;
        face = faceEdge.face;
      } while(faceEdge != vertex.edge);
      F.scale(1/n);
      R.scale(1/n);

      var newVert = F.dup();
      newVert.add(R.scaled(1));
      newVert.add(vertex.scaled(n-2));
      newVert.scale(1/n);

      vertex.x = newVert.x;
      vertex.y = newVert.y;
      vertex.z = newVert.z;
    }

    for(var i in hemesh.faces) {
      var face = hemesh.faces[i];
      var edge = face.edge;
      do {
        var e0 = new HEEdge(edge.vert);
        var e1 = new HEEdge(edge.edgePoint);
        var e2 = new HEEdge(edge.face.facePoint);
        var e3 = new HEEdge(edge.findPrev().edgePoint);
        e0.next = e1;
        e1.next = e2;
        e2.next = e3;
        e3.next = e0;
        edge = edge.next;
        newEdges.push(e0);
        newEdges.push(e1);
        newEdges.push(e2);
        newEdges.push(e3);
        var newFace = new HEFace(e0);
        e0.face = e1.face = e2.face = e3.face = newFace;
        newFaces.push(newFace);
      } while (edge != face.edge);
    }
    hemesh.edges = newEdges;
    hemesh.faces = newFaces;
    hemesh.assignEdgesToVertices();
    hemesh.assignEdgePairs();
    return hemesh;
  }

  return CatmullClark;
});

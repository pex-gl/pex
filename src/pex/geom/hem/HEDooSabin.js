//Doo-Sabin subdivision as desribed in WIRE AND COLUMN MODELING
//http://repository.tamu.edu/bitstream/handle/1969.1/548/etd-tamu-2004A-VIZA-mandal-1.pdf
define([
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HEDooSabin() {

  }

  HEMesh.prototype.smoothDooSabin = function(depth) {
    if (depth) this.depth = depth;

    this.clearSelection();
    //keep these numbers to iterate only over original faces/edges/vertices
    var numFaces = this.faces.length;
    var numEdges = this.edges.length;
    var numVertices = this.vertices.length;
    var i;

    //For each face, add a face point - the centroid of all original
    //points for the respective face
    for(i=0; i<numFaces; i++) {
      this.faces[i].facePoint = this.faces[i].getCenter();
    }

    //For each edge, add an edge point - the average of
    //the two neighbouring face points and its two original endpoints.
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.edgePoint != null) continue;
      if (!edge.vert.position) console.log(edge.vert);
      var edgePoint = edge.vert.position.dup();
      edgePoint.add(edge.next.vert.position);
      edgePoint.scale(1/2);
      edge.edgePoint = edgePoint;
      edge.pair.edgePoint = edge.edgePoint;
    }


    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];
      var edge = face.edge;
      //loop through face edges and add one point for each vertex
      do {
        var vert = edge.vert.position;
        var newVert = vert.dup();
        newVert.add(face.facePoint);
        newVert.add(edge.edgePoint);
        newVert.add(edge.findPrev().edgePoint);
        newVert.scale(1/4);

        if (this.depth) {
          var tmp = newVert.dup().sub(vert);
          tmp.normalize();
          tmp.scale(this.depth);
          newVert = vert.dup().add(tmp);
        }

        edge.edgeFacePoint = new HEVertex(newVert.x, newVert.y, newVert.z);
        this.vertices.push(edge.edgeFacePoint);

        edge = edge.next;
      } while (edge != face.edge);
    }

    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];
      var edge = face.edge;
      //loop through faces and new face in the middle of the old one
      var newEdges = [];
      do {
        var newEdge = new HEEdge(edge.edgeFacePoint);
        newEdge.face = face;
        newEdges.push(newEdge);
        this.edges.push(newEdge);
        edge = edge.next;
      } while (edge != face.edge);

      for(var j=0; j<newEdges.length; j++) {
        newEdges[j].next = newEdges[(j+1) % newEdges.length];
      }
      face.edge = newEdges[0];
    }

    var edgeFaces = 0;
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.selected) continue;

      edge.selected = true;
      edge.pair.selected = true;

      var a = edge.edgeFacePoint;
      var b = edge.next.edgeFacePoint;
      var c = edge.pair.edgeFacePoint;
      var d = edge.pair.next.edgeFacePoint;
      var ea = new HEEdge(a);
      var eb = new HEEdge(b);
      var ec = new HEEdge(c);
      var ed = new HEEdge(d);
      //clock counter-wise
      ea.next = ed;
      ed.next = ec;
      ec.next = eb;
      eb.next = ea;

      var edgeFace = new HEFace(ea);
      ea.face = eb.face = ec.face = ed.face = edgeFace;
      this.faces.push(edgeFace);
      //hemesh.edges.push(ea, eb, ec, ed);
      this.edges.push(ea);
      this.edges.push(eb);
      this.edges.push(ec);
      this.edges.push(ed);

      ea.face = edgeFace;
      ed.face = edgeFace;
      ec.face = edgeFace;
      eb.face = edgeFace;

      edgeFaces++;
    }

    for(var i=0; i<numVertices; i++) {
      var vertex = this.vertices[i];
      var edge = vertex.edge;
      var prev = null;
      var first = null;

      var vertexFace = new HEFace();
      this.faces.push(vertexFace);
      do {
        var newEdge = new HEEdge(edge.edgeFacePoint);
        newEdge.face = vertexFace;
        this.edges.push(newEdge);

        if (!first) {
          first = newEdge;
          vertexFace.edge = newEdge;
        }

        //clock counter-wise order
        if (prev) newEdge.next = prev;

        prev = newEdge;

        edge = edge.pair.next;
      } while(edge != vertex.edge)

      //close the loop
      first.next = prev;
    }

    //remove old edges
    this.vertices.splice(0, numVertices);
    this.edges.splice(0, numEdges);
    this.fixDuplicatedVertices();
    this.fixVertexEdges();
    this.fixEdgePairs();

    this.check();

    return this;
  }

  return HEDooSabin;
});

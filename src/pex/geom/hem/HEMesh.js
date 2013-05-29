//Half-Edge mesh data structure
//Based on http://www.flipcode.com/archives/The_Half-Edge_Data_Structure.shtml
//and http://fgiesen.wordpress.com/2012/03/24/half-edge-based-mesh-representations-practice/
define([
  'pex/geom/Vec3',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEFace',
  'pex/geom/BoundingBox',
  'pex/geom/Octree'
],
function(Vec3, HEEdge, HEVertex, HEFace, BoundingBox, Octree) {
  function HEMesh() {
    this.vertices = new Array();
    this.faces = new Array();
    this.edges = new Array();
  }

  HEMesh.prototype.fixDuplicatedVertices = function() {
    var bbox = BoundingBox.fromPoints(this.vertices.map(function(v) { return v.position; }));
    var octree = Octree.fromBoundingBox(bbox);
    var dup = 0;
    for(var i=0; i<this.vertices.length; i++) {
      var v = this.vertices[i];
      var duplicate = octree.has(v.position);
      if (!duplicate) {
        v.position.vertex = v;
        octree.add(v.position);
      }
      else {
        this.vertices.splice(i, 1);
        i--;
        var duplicateVertex = duplicate.vertex;
        for(var j=0; j<this.edges.length; j++) {
          if (this.edges[j].vert == v) {
            this.edges[j].vert = duplicateVertex;
          }
        }
      }
    }
    return this;
  }

  HEMesh.prototype.faceHash = function(f) {
    var vertices = f.getAllVertices();
    var indices = vertices.map(function(v) {
      return this.vertices.indexOf(v);
    }.bind(this));
    indices = indices.sort();
    var hash = indices.join('_');
    if (indices[0] == indices[1] || indices[1] == indices[2]) {
      console.log(hash);
    }
    return hash;
  }

  HEMesh.prototype.edgeHash = function(e) {
    var i = this.vertices.indexOf(e.vert);
    var j = this.vertices.indexOf(e.next.vert);
    var hash = i + "_" + j;
    return hash;
  }

  HEMesh.prototype.fixDuplicatedEdges = function() {
    var uniques = [];
    for(var i=0; i<this.edges.length; i++) {
      var edge = this.edges[i];
      var hash = this.edgeHash(edge);
      var duplicateIndex = uniques.indexOf(hash);
      var duplicate = (duplicateIndex !== -1);
      if (!duplicate) {
        uniques.push(hash);
      }
      else {
        var duplicateEdge = this.edges[duplicateIndex];
        this.edges.splice(i, 1);
        i--;
        this.vertices.forEach(function(v) {
          if (v.edge == edge) v.edge = duplicateEdge;
        });
        this.faces.forEach(function(f) {
          if (f.edge == edge) {
            f.edge = duplicateEdge;
            f.edge.face = f;
          }
        });
      }
    }
  }

  HEMesh.prototype.fixVertexEdges = function() {
    this.vertices.forEach(function(v) {
      v.edge = null;
    });
    for(var i in this.edges) {
      var edge = this.edges[i];
      edge.vert.edge = edge;
    }
    return this;
  }

  var pairs = 0;
  HEMesh.prototype.fixEdgePairs = function() {
    for(var i=0; i<this.edges.length; i++) {
      this.edges[i].pair = null;
    }
    var numPairs = 0;
    var hash = {};
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].index = i;
    }
    for(var i=0; i<this.edges.length; i++) {
      var edge = this.edges[i];
      var edgeHash = edge.vert.index + "," + edge.next.vert.index;
      var pairEdgeHash = edge.next.vert.index + "," + edge.vert.index;
      hash[edgeHash] = edge;
      if (hash[pairEdgeHash]) {
        edge.pair = hash[pairEdgeHash];
        edge.pair.pair = edge;
      }
    }
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].index = -1;
    }
    return this;
  }

  // HEMesh.prototype.getEdgeBetween = function(a, b) {
  //       for(var i in this.edges) {
  //         var edge = this.edges[i];
  //         if (edge.vert == a && edge.next.vert == b) {
  //           return edge;
  //         }
  //       }
  //       return null;
  //   }

  HEMesh.prototype.check = function() {
    for(var i in this.vertices) {
      if (this.vertices[i].edge == null) {
        console.log("Missing vertex edge at ", i);
      }
      else if (this.vertices[i] != this.vertices[i].edge.vert) {
        console.log("Edge doesn't point to it's vertex at ", i);
      }
    }

    for(var i in this.faces) {
      if (this.faces[i].edge == null) {
        console.log("Missing faces edge at ", i);
      }
      else if (this.faces[i] != this.faces[i].edge.face) {
        console.log("Edge doesn't point to it's face at ", i);
      }

      if (this.edges.indexOf(this.faces[i].edge) === -1) {
        console.log("Invalid face edge at ", i);
      }
    }

    for(var i in this.edges) {
      var edge = this.edges[i];
      var e = edge;
      var watchDog = 0;

      if (edge.pair == null) {
        console.log("Edge doesn't have it's pair", i);
      }
      else if (edge.pair.pair != edge) {
        console.log("Edge pair doesn't match", i, this.edges.indexOf(edge), this.edges.indexOf(edge.pair), this.edges.indexOf(edge.pair.pair));
      }

      do {
        if (++watchDog > 100) {
          console.log("Edge watchDog break at", i, " . Wrong edge loop pointers?");
          break;
        }
        if (watchDog > 6) {
          console.log("Warning! Face with " + watchDog + " vertices");
        }
        if (e.next == null) {
          console.log("Missing edge next at ", i, ". Open loop.");
          break;
        }
        e = e.next;
      } while(e != edge)
    }

    return this;
  };

  HEMesh.prototype.splitVertex = function(vertex, newVertexPos, startEdge, endEdge) {
    var newVertex = new HEVertex(newVertexPos.x, newVertexPos.y, newVertexPos.z);
    this.vertices.push(newVertex);
    if (startEdge != null && startEdge == endEdge) {
      //edge
      var e = startEdge;
      var e2 = new HEEdge();
      e2.vert = newVertex;
      e2.next = e.next;
      e.next = e2;
      e2.face = e.face;
      this.edges.push(e2);
      newVertex.edge = e2;

      //opposite edge
      var o = startEdge.pair;
      var o2 = new HEEdge();
      o2.vert = newVertex;
      o2.next = o.next;
      o.next = o2;
      o2.face = o.face;
      this.edges.push(o2);

      o2.pair = e;
      e.pair = o2;

      e2.pair = o;
      o.pair = e2;

      return e2;
    }
    else if (startEdge == null && endEdge == null) {
      var newEdge1 = new HEEdge();
      var newEdge2 = new HEEdge();

      var edge = vertex.edge;
      var prevEdge = edge.findPrev();

      newEdge1.vert = vertex;
      newEdge2.vert = newVertex;
      newEdge1.face = edge.face;
      newEdge2.face = edge.face;

      newEdge1.next = newEdge2;
      newEdge2.next = edge;

      newEdge1.pair = newEdge2;
      newEdge2.pair = newEdge1;

      vertex.edge = newEdge1;
      prevEdge.next = newEdge1;

      newVertex.edge = newEdge2;

      this.edges.push(newEdge1);
      this.edges.push(newEdge2);

      return newEdge1;
    }
  };

  HEMesh.prototype.splitFace = function(vert1Edge, vert2Edge) {
    var vert1EdgeNext = vert1Edge.next;
    var vert2EdgeNext = vert2Edge.next;
    var vert1EdgePrev = vert1Edge.findPrev();
    var vert2EdgePrev = vert2Edge.findPrev();
    var oldFace = vert1Edge.face;

    var splitEdge1 = new HEEdge();
    var splitEdge2 = new HEEdge();
    this.edges.push(splitEdge1);
    this.edges.push(splitEdge2);

    splitEdge1.pair = splitEdge2;
    splitEdge2.pair = splitEdge1;

    splitEdge1.vert = vert2Edge.vert;
    splitEdge2.vert = vert1Edge.vert;

    splitEdge1.next = vert1Edge;
    vert2EdgePrev.next = splitEdge1;

    splitEdge2.next = vert2Edge;
    vert1EdgePrev.next = splitEdge2;

    splitEdge1.face = vert1Edge.face;

    var newFace = new HEFace(splitEdge2);
    this.faces.push(newFace);

    var tmpEdge = splitEdge2;
    do {
      tmpEdge.face = newFace;
      tmpEdge = tmpEdge.next;
    } while(tmpEdge != splitEdge2);

    //just ot make sure we don't point to one of the splitten vertices
    oldFace.edge = vert1Edge;

    if (oldFace.color) newFace.color = oldFace.color;

    return newFace;
  };

  HEMesh.prototype.splitEdge = function(edge, ratio) {
    ratio = ratio || 0.5;

    //newVertPos = v + ratio * (nv - v)
    //newVertPos = add3(v, scale3(ratio, sub3(nv, v)))
    //newVertPos = nv.clone().sub(v).scale(ratio).add(v);
    var newVertPos = Vec3.create()
      .asSub(edge.next.vert.position, edge.vert.position)
      .scale(ratio)
      .add(edge.vert.position);

    this.splitVertex(edge.vert, newVertPos, edge, edge);
  };

  HEMesh.prototype.splitFaceAtPoint = function(face, newPoint) {
    var vert = face.edge.vert;
    var edge = face.edge;
    vert.edge = edge; //to make sure we split the right face
    var newEdge = this.splitVertex(vert, newPoint); //new edges will be added before 'edge'
    var from = newEdge.next;
    var to = from.next.next; //next corner afther the old first
    //split the face from the new vertex to the next corner
    //and move one corner further
    var i = 0;
    do {
      this.splitFace(from, to);
      from = to.findPrev();
      to = from.next.next;
    } while (to != newEdge);

    return newEdge.next;
  };

  return HEMesh;
});

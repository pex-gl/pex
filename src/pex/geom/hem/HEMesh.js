//Half-Edge mesh data structure
//Based on http://www.flipcode.com/archives/The_Half-Edge_Data_Structure.shtml
define(["pex/core/Vec3", "pex/geom/hem/HEEdge", "pex/geom/hem/HEVertex"], function(Vec3, HEEdge, HEVertex) {
  function HEMesh() {
    this.vertices = [];
    this.faces = [];
    this.edges = [];
  }

  HEMesh.prototype.assignEdgesToVertices = function() {
    for(var i in this.edges) {
      var edge = this.edges[i];
      edge.vert.edge = edge;
    }
  }

  var pairs = 0;
  HEMesh.prototype.assignEdgePairs = function() {
    for(var i in this.edges) {
      var a = this.edges[i];
      for(var j in this.edges) {
        if (i == j) continue;
        var b = this.edges[j];
        if (a.vert == b.next.vert && a.next.vert == b.vert) {
          a.pair = b;
          b.pair = a;
        }
      }
    }
  }

  HEMesh.prototype.getEdgeBetween = function(a, b) {
      for(var i in this.edges) {
        var edge = this.edges[i];
        if (edge.vert == a && edge.next.vert == b) {
          return edge;
        }
      }
      return null;
  }

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
    }

    for(var i in this.edges) {
      var edge = this.edges[i];
      var e = edge;
      var watchDog = 0;
      do {
        if (++watchDog > 100) {
          console.log("Edge watchDog break at", i, " . Wrong edge loop pointers?");
          break;
        }
        if (e.next == null) {
          console.log("Missing edge next at ", i, ". Open loop.");
          break;
        }
        e = e.next;
      } while(e != edge)
    }
  }

  return HEMesh;
});

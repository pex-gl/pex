define(["pex/core/Vec3", "pex/core/Geometry", "pex/core/Edge"], function(Vec3, Geometry, Edge) {
  function Path() {
    this.vertices = [];
    this.edges = [];
    this.stop = false;
    this.closed = false;
    this.maxLength = 0; 
  }

  Path.prototype = new Geometry();

  Path.prototype.addPoint = function(p) {
    if (this.stop) return;
    this.vertices.push(p);
    if (this.maxLength && (this.vertices.length > this.maxLength)) {
      this.vertices.shift();
      this.edges.shift();

      for(var i=0; i<this.edges.length; i++) {
        --this.edges[i].a;
        --this.edges[i].b;
      }
    }
    if (this.vertices.length > 1) {
      this.edges.push(new Edge(this.vertices.length - 1, this.vertices.length - 2));
    }
  }

  Path.prototype.close = function() {
    this.closed = true;
    this.edges.push(new Edge(this.vertices.length - 1, 0));
  }

  return Path;
})

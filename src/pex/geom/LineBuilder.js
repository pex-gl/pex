define(["pex/core/Core", "pex/geom/Geometry"], function(Core, Geometry) {
  function LineBuilder() {
    this.vertices = [];
    this.colors = [];
    this.edges = [];
    this.vertexCount = 0;

    this.reset();
  }

  LineBuilder.prototype = new Geometry();

  LineBuilder.prototype.reset = function() {
    this.vertices = [];
    this.colors = [];
    this.edges = [];
    this.vertexCount = 0;
  }

  LineBuilder.prototype.addLine = function(pos1, pos2, color1, color2) {
    this.vertices.push(pos1);
    this.vertices.push(pos2);
    this.colors.push(color1);
    this.colors.push(color2);
    this.edges.push(new Core.Edge(this.vertexCount, this.vertexCount + 1));
    this.vertexCount += 2;
  }

  LineBuilder.prototype.addPath = function(positions, colors) {
    for(var i=0; i<positions.length; i++) {
      this.vertices.push(positions[i]);
      this.colors.push(colors[i]);

      if (i > 0) {
        this.edges.push(new Core.Edge(this.vertexCount + i - 1, this.vertexCount + i));
      }
    }

    this.vertexCount += positions.length;
  }

  LineBuilder.prototype.addCircle = function(pos, r, color, transform) {
    for(var i=0; i<36; i++) {
      var dpos = new Core.Vec3(r * Math.cos(Math.PI * 2 * i / 36), r * Math.sin(Math.PI * 2 * i / 36), 0);
      if (transform) {
        dpos = transform.multVec3(dpos);
      }
      var p = pos.added(dpos);
      this.vertices.push(p);
      this.colors.push(color);
      this.edges.push(new Core.Edge(this.vertexCount + i, this.vertexCount + (i + 1) % 36));
    }
    this.vertexCount += 36;
  }

  return LineBuilder;
})
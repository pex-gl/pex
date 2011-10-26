define(["pex/core/Vec3", "pex/core/Vec4", "pex/core/Edge", "pex/geom/Geometry"], function(Vec3, Vec4, Edge, Geometry) {
  var whiteColor = new Vec4(1,1,1,1);

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

    if (color1 && !color2) color2 = color1;
    if (color1) this.colors.push(color1);
    if (color2) this.colors.push(color2);
    this.edges.push(new Edge(this.vertexCount, this.vertexCount + 1));
    this.vertexCount += 2;
  }

  LineBuilder.prototype.addPath = function(positions, colors) {
    for(var i=0; i<positions.length; i++) {
      this.vertices.push(positions[i]);

      if (colors) {
        this.colors.push(colors[i]);
      }

      if (i > 0) {
        this.edges.push(new Edge(this.vertexCount + i - 1, this.vertexCount + i));
      }
    }

    this.vertexCount += positions.length;
  }

  LineBuilder.prototype.addCircle = function(pos, r, color, transform) {
    for(var i=0; i<36; i++) {
      var dpos = new Vec3(r * Math.cos(Math.PI * 2 * i / 36), r * Math.sin(Math.PI * 2 * i / 36), 0);
      if (transform) {
        dpos = transform.multVec3(dpos);
      }
      var p = pos.added(dpos);
      this.vertices.push(p);
      if (color) this.colors.push(color);
      this.edges.push(new Edge(this.vertexCount + i, this.vertexCount + (i + 1) % 36));
    }
    this.vertexCount += 36;
  }

  return LineBuilder;
})
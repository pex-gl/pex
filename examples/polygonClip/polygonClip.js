var pex = require('../../build/pex');

var Polygon2D = pex.geom.Polygon2D;
var Vec2 = pex.geom.Vec2;
var Vec4 = pex.geom.Vec4;

pex.sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '2d'
  },
  init: function() {
    var W = this.width;
    var H = this.height;

    this.targetPolygon = new Polygon2D([
      Vec2.fromValues(W/2 - 70, H/2 -  50),
      Vec2.fromValues(W/2 -  90, H/2 +  20),
      Vec2.fromValues(W/2 +   0, H/2 + 150),
      Vec2.fromValues(W/2 + 200, H/2 -  20),
      Vec2.fromValues(W/2 + 150, H/2 -  70)
    ]);

    this.clippingPolygon = new Polygon2D([
      Vec2.fromValues(W/2, H/2 - 150),
      Vec2.fromValues(W/2 - 150, H/2 + 170),
      Vec2.fromValues(W/2 + 150, H/2 + 200)
    ]);

    this.resultPolygon = this.targetPolygon.clip(this.clippingPolygon);

    this.on("mouseMoved", function(e) {
      this.clippingPolygon = new Polygon2D([
        Vec2.fromValues(+ e.x, - 150 + e.y),
        Vec2.fromValues(- 150 + e.x, + 170 + e.y),
        Vec2.fromValues(+ 150 + e.x, + 200 + e.y)
      ]);
      this.resultPolygon = this.targetPolygon.clip(this.clippingPolygon);
    }.bind(this))
  },
  drawPolygon: function(polygon, color) {
    var canvas = this.canvas;
    var paint = this.paint;

    paint.setStroke();
    paint.setColor(color.r * 255, color.g * 255, color.b * 255, 255);
    paint.setFlags(paint.kAntiAliasFlag);

    polygon.vertices.forEach(function(v, i) {
      var nv = polygon.vertices[(i + 1) % polygon.vertices.length];
      canvas.drawLine(paint, v[0], v[1], nv[0], nv[1]);
    });
  },
  fillPolygon: function(polygon, color) {
    var canvas = this.canvas;
    var paint = this.paint;

    if (polygon.vertices.length == 0) return;

    paint.setFill();
    //paint.setColor(color[0], color[1], color[2], 128);
    paint.setColor(255, 255, 0, 128);
    paint.setFlags(paint.kAntiAliasFlag);

    var path = new pex.sys.Node.plask.SkPath();
    path.moveTo(polygon.vertices[0][0], polygon.vertices[0][1]);

    var numVertices = polygon.vertices.length;
    for(var i=0, j; i<numVertices; i++) {
      j = (i+1) % numVertices;
      path.lineTo(polygon.vertices[j][0], polygon.vertices[j][1]);
    }

    canvas.drawPath(paint, path);
  },
  draw: function() {
    this.canvas.clear(215, 215, 215, 255);
    this.drawPolygon(this.targetPolygon, Vec4.fromValues(0,0,0,255));
    this.drawPolygon(this.clippingPolygon, Vec4.fromValues(255,0,0,255));
    this.fillPolygon(this.resultPolygon, Vec4.fromValues(0,255,0,255));
  }
});
var pex = require('../../build/pex');

var Polygon2D = pex.geom.Polygon2D;
var Vec2 = pex.geom.Vec2;
var Color = pex.color.Color;

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
      Vec2.create(W/2 -  70, H/2 -  50),
      Vec2.create(W/2 -  90, H/2 +  20),
      Vec2.create(W/2,       H/2 + 150),
      Vec2.create(W/2 + 200, H/2 -  20),
      Vec2.create(W/2 + 150, H/2 -  70)
    ]);

    this.clippingPolygon = new Polygon2D([
      Vec2.create(W/2, H/2 - 150),
      Vec2.create(W/2 - 150, H/2 + 170),
      Vec2.create(W/2 + 150, H/2 + 200)
    ]);

    this.resultPolygon = this.targetPolygon.clip(this.clippingPolygon);

    this.on("mouseMoved", function(e) {
      this.clippingPolygon = new Polygon2D([
        Vec2.create(+ e.x, - 150 + e.y),
        Vec2.create(- 150 + e.x, + 170 + e.y),
        Vec2.create(+ 150 + e.x, + 200 + e.y)
      ]);
      this.resultPolygon = this.targetPolygon.clip(this.clippingPolygon);
    }.bind(this));
  },
  drawPolygon: function(polygon, color) {
    var canvas = this.canvas;
    var paint = this.paint;

    paint.setStroke();
    paint.setColor(color.r * 255, color.g * 255, color.b * 255, 255);
    paint.setFlags(paint.kAntiAliasFlag);

    polygon.vertices.forEach(function(v, i) {
      var nv = polygon.vertices[(i + 1) % polygon.vertices.length];
      canvas.drawLine(paint, v.x, v.y, nv.x, nv.y);
    });
  },
  fillPolygon: function(polygon, color) {
    var canvas = this.canvas;
    var paint = this.paint;

    if (polygon.vertices.length === 0) return;

    paint.setFill();
    //paint.setColor(color[0], color[1], color[2], 128);
    paint.setColor(255, 255, 0, 128);
    paint.setFlags(paint.kAntiAliasFlag);

    var path = new pex.sys.Node.plask.SkPath();
    path.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);

    var numVertices = polygon.vertices.length;
    for(var i=0, j; i<numVertices; i++) {
      j = (i+1) % numVertices;
      path.lineTo(polygon.vertices[j].x, polygon.vertices[j].y);
    }

    canvas.drawPath(paint, path);
  },
  draw: function() {
    this.canvas.clear(215, 215, 215, 255);
    this.drawPolygon(this.targetPolygon, Color.create(0,0,0,1));
    this.drawPolygon(this.clippingPolygon, Color.create(1,0,0,1));
    this.fillPolygon(this.resultPolygon, Color.create(0,1,0,1));

    this.paint.setFill();
    this.paint.setColor(255, 0, 0, 255);
    var c = this.clippingPolygon.getCenter();
    this.canvas.drawText(this.paint, "" + this.resultPolygon.getArea(), c.x, c.y);
  }
});

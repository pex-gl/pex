var pex = require('../../build/pex');

var Polygon2D = pex.geom.Polygon2D;
var Vec2 = pex.geom.Vec2;
var Line2D = pex.geom.Line2D;
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

    pex.utils.MathUtils.seed(1);

    var center = Vec2.create(W/2, H/2);
    this.points = [];
    this.points.push(center);
    for(var i=0; i<5; i++) {
      this.points.push(Vec2.create(W * Math.random(), H * Math.random()))
    }

    this.lines = [];
    for(var i=1; i<this.points.length; i++) {
      var midPoint = this.points[i].dup().sub(center).scale(0.5).add(center);
      var dir = midPoint.dup().sub(center).normalize().scale(200);
      var perp = Vec2.create(-dir.y, dir.x);
      var a = midPoint.dup().add(perp);
      var b = midPoint.dup().sub(perp);
      this.lines.push(new Line2D(a, b));
    }

    this.targetPolygon = new Polygon2D([
      Vec2.create(0, 0),
      Vec2.create(W, 0),
      Vec2.create(W, H),
      Vec2.create(0, H)
    ]);

    this.resultPolygon = this.targetPolygon;

    this.lines.forEach(function(line) {
      this.resultPolygon = this.resultPolygon.clipToLine(line);
    }.bind(this))

    /*
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
    }.bind(this))
    */
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

    if (polygon.vertices.length == 0) return;

    paint.setFill();
    paint.setColor(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
    //paint.setColor(255, 255, 0, 128);
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
  drawPoint: function(p) {
    this.paint.setStroke();
    this.paint.setColor(200,50,50,255);
    this.canvas.drawRect(this.paint,p.x, p.y, p.x+5, p.y+5);
  },
  drawLine: function(l) {
    this.paint.setStroke();
    this.paint.setColor(0,220,220,255);
    this.canvas.drawLine(this.paint,l.a.x, l.a.y, l.b.x, l.b.y);
  },
  draw: function() {
    this.canvas.clear(50, 50, 50, 255);

    this.drawPolygon(this.targetPolygon, Color.create(1,0,0,1));
    this.fillPolygon(this.resultPolygon, Color.create(0,0.25,0,1));
    this.drawPolygon(this.resultPolygon, Color.create(1,1,0,1));

    this.points.forEach(this.drawPoint.bind(this));
    this.lines.forEach(this.drawLine.bind(this));
    /*
    this.drawPolygon(this.clippingPolygon, Color.create(1,0,0,1));
    this.paint.setFill();
    this.paint.setColor(255, 0, 0, 255);
    var c = this.clippingPolygon.getCenter();
    this.canvas.drawText(this.paint, "" + this.resultPolygon.getArea(), c.x, c.y);
    */
  }
});
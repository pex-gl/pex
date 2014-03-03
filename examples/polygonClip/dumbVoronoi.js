var pex = require('../../build/pex');

var Polygon2D = pex.geom.Polygon2D;
var Vec2 = pex.geom.Vec2;
var Line2D = pex.geom.Line2D;
var Color = pex.color.Color;
var Time = pex.utils.Time;

pex.sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '2d'
  },
  init: function() {
    var circlePoints = [];
    for(var i=0; i<36; i++) {
      circlePoints.push(Vec2.create(
        this.width / 2 + 300 * Math.cos(i/36 * Math.PI * 2),
        this.height / 2 + 300 * Math.sin(i/36 * Math.PI * 2)
      ));
    }
    this.circle = new Polygon2D(circlePoints);
  },
  update: function() {
    var W = this.width;
    var H = this.height;
    pex.utils.MathUtils.seed(1);

    this.points = [ Vec2.create(W/2, H/2) ];
    for(var i=0; i<50; i++) {
      this.points.push(Vec2.create(W * Math.random() + 50*Math.cos(Time.seconds + i * 12.2312313), H * Math.random() + 50*Math.sin(Time.seconds)));
    }

    this.points.forEach(function(point, i) {
     point.polygon = new Polygon2D([
        Vec2.create(0, 0),
        Vec2.create(W, 0),
        Vec2.create(W, H),
        Vec2.create(0, H)
      ]);
      point.polygon = this.circle;
      point.lines = [];
      this.points.forEach(function(anotherPoint, j) {
        if (i == j) return;
        var midPoint = anotherPoint.dup().sub(point).scale(0.5).add(point);
        var dir = midPoint.dup().sub(point);
        //what if points are the same? then there is no perp vector because dir.length == 0
        var perp = Vec2.create(-dir.y, dir.x);
        var a = midPoint.dup().add(perp);
        var b = midPoint.dup().sub(perp);
        point.lines.push(new Line2D(a, b));
      });
      point.lines.forEach(function(line) {
        point.polygon = point.polygon.clipToLine(line);
      });
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
    this.paint.setColor(250,250,250,255);
    this.canvas.drawRect(this.paint,p.x, p.y, p.x+5, p.y+5);
  },
  drawLine: function(l) {
    this.paint.setStroke();
    this.paint.setColor(0,220,220,255);
    this.canvas.drawLine(this.paint,l.a.x, l.a.y, l.b.x, l.b.y);
  },
  draw: function() {
    this.canvas.clear(50, 50, 50, 255);
    this.update();

    this.points.forEach(function(point){
      this.fillPolygon(point.polygon, Color.create(0,0.25,0,1));
      this.drawPolygon(point.polygon, Color.create(1,1,0,1));
      this.drawPoint(point);
    }.bind(this));

    this.drawPolygon(this.circle, Color.Red);
  }
});

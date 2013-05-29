var pex = require('../../build/pex.js');

var Vec2 = pex.geom.Vec2;
var Line2D = pex.geom.Line2D;

pex.sys.Window.create({
  settings: {
    type: '2d',
    width: 800,
    height: 600
  },
  point: Vec2.create(0, 0),
  line: new Line2D(Vec2.create(20, 50), Vec2.create(700, 400)),
  line2: new Line2D(Vec2.create(120, 150), Vec2.create(800, 500)),
  init: function() {
    this.on('mouseMoved', function(e) {
      this.point.x = e.x;
      this.point.y = e.y;
    }.bind(this));
  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;

    canvas.clear(0, 0, 0, 255);

    paint.setFill();
    paint.setColor(0, 255, 0, 255);

    canvas.drawCircle(paint, this.point.x, this.point.y, 5, 5);

    paint.setColor(255, 0, 0, 255);
    paint.setStroke();
    canvas.drawLine(paint, this.line.a.x, this.line.a.y, this.line.b.x, this.line.b.y);
    canvas.drawLine(paint, this.line2.a.x, this.line2.a.y, this.line2.b.x, this.line2.b.y);

    var hit = this.line.projectPoint(this.point);
    paint.setColor(0, 255, 0, 255);
    canvas.drawLine(paint, this.point.x, this.point.y, hit.x, hit.y);

    paint.setColor(255, 0, 0, 255);
    paint.setFill();
    canvas.drawCircle(paint, hit.x, hit.y, 5, 5);

    var perpendicularLine = new Line2D(hit, this.point);
    var intersection = perpendicularLine.intersect(this.line2);
    if (intersection) {
      canvas.drawCircle(paint, intersection.x, intersection.y, 5, 5);
      paint.setStroke();
      paint.setColor(255, 255, 0, 255);
      canvas.drawLine(paint, intersection.x, intersection.y, this.point.x, this.point.y);
    }
  }
});
var pex = require('../../build/pex.js');

var Vec2 = pex.geom.Vec2;
var Line2D = pex.geom.Line2D;

pex.sys.Window.create({
  settings: {
    type: '2d',
    width: 800,
    height: 600
  },
  point: Vec2.fromValues(0, 0),
  line: new Line2D(Vec2.fromValues(20, 50), Vec2.fromValues(700, 400)),
  init: function() {
    this.on('mouseMoved', function(e) {
      this.point[0] = e.x;
      this.point[1] = e.y;
    }.bind(this));
  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;

    canvas.clear(0, 0, 0, 255);

    paint.setFill();
    paint.setColor(0, 255, 0, 255);

    canvas.drawCircle(paint, this.point[0], this.point[1], 5, 5);

    paint.setColor(255, 0, 0, 255);
    paint.setStroke();
    canvas.drawLine(paint, this.line.a[0], this.line.a[1], this.line.b[0], this.line.b[1]);

    var hit = Vec2.create();
    this.line.projectPoint(hit, this.point);
    paint.setColor(0, 255, 0, 255);
    canvas.drawLine(paint, this.point[0], this.point[1], hit[0], hit[1]);

    paint.setColor(255, 0, 0, 255);
    paint.setFill();
    canvas.drawCircle(paint, hit[0], hit[1], 5, 5);
  }
});
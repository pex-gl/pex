var Pex = require("../../src/pex/pex-plask");

Pex.run(["pex/Pex", "plask"],
  function(Pex, plask) {
    var Core = Pex.Core;
    var Vec2 = Core.Vec2;
    var Polygon2D = Core.Polygon2D;

    Pex.Sys.Window.create({
      settings: {
        width: 1280,
        height: 720,
        type: '2d',
      },
      init: function() {
        var W = this.width;
        var H = this.height;

        this.pointStart = new Vec2(this.width/2, this.height/2);
        this.pointEnd = new Vec2(this.width/2, this.height/2 + this.height/4);

        this.line = new Core.Line2D(this.pointStart, this.pointEnd);

        var self = this;
        this.on("mouseMoved", function(e) {
          self.pointEnd.x = e.x;
          self.pointEnd.y = e.y;
        })
      },
      draw: function() {
        this.paint.setStroke();
        this.paint.setColor(0, 0, 0);
        this.paint.setAntiAlias(true);
        this.canvas.clear(255, 255, 255);
        this.canvas.drawLine(this.paint, this.line.a.x, this.line.a.y, this.line.b.x, this.line.b.y);

        this.paint.setFill();

        var self = this;
        function drawPoint(p) {
          self.paint.setFill();
          if (self.line.isPointOnTheLeftSide(p))
            self.paint.setColor(0, 255, 0);
          else
            self.paint.setColor(255, 0, 0);
          self.canvas.drawCircle(self.paint, p.x, p.y, 5);
        }
        drawPoint(new Vec2(this.width*0.2, this.height/2));
        drawPoint(new Vec2(this.width*0.8, this.height/2));
      }
    });
  }
);

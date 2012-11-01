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

        //var line = new Core.Line2D(new Vec2(640, 200), new Vec2(490, 530));
        var line = new Core.Line2D(new Vec2(640, 200), new Vec2(490, 530));
        console.log(line.isPointOnTheLeftSide(new Vec2(570, 300)));

        //var line = new Core.Line2D(new Vec2(0, 0), new Vec2(0, 10));
        //console.log(line.isPointOnTheLeftSide(new Vec2(-1, 1)));

        this.targetPolygon = new Polygon2D([
          new Vec2(W/2 - 70, H/2 -  50),
          new Vec2(W/2 -  90, H/2 +  20),
          new Vec2(W/2 +   0, H/2 + 150),
          new Vec2(W/2 + 200, H/2 -  20),
          new Vec2(W/2 + 150, H/2 -  70)
        ]);

        this.clippingPolygon = new Polygon2D([
          new Vec2(W/2, H/2 - 150),
          new Vec2(W/2 - 150, H/2 + 170),
          new Vec2(W/2 + 150, H/2 + 200)
        ]);
        this.resultPolygon = this.targetPolygon.clip(this.clippingPolygon);
        console.log("BLA", this.resultPolygon);
        console.log("Target poly", this.targetPolygon.isClockwise(), this.targetPolygon.getArea())
        console.log("Clipping poly", this.clippingPolygon.isClockwise(), this.clippingPolygon.getArea())

        var self = this;
        this.on("mouseMoved", function(e) {
          self.clippingPolygon = new Polygon2D([
            new Vec2(+ e.x, - 150 + e.y),
            new Vec2(- 150 + e.x, + 170 + e.y),
            new Vec2(+ 150 + e.x, + 200 + e.y)
          ]);
          self.resultPolygon = self.targetPolygon.clip(self.clippingPolygon);
        })
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
        })
      },
      fillPolygon: function(polygon, color) {
        var canvas = this.canvas;
        var paint = this.paint;

        if (polygon.vertices.length == 0) return;

        paint.setFill();
        paint.setColor(color.r * 255, color.g * 255, color.b * 255, 128);
        paint.setFlags(paint.kAntiAliasFlag);

        var path = new plask.SkPath();
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
        this.drawPolygon(this.targetPolygon, Core.Color.Black);
        this.drawPolygon(this.clippingPolygon, Core.Color.Red);
        this.fillPolygon(this.resultPolygon, Core.Color.Green);
      }
    });
  }
);

var Pex = require("../../src/pex/pex-plask");

Pex.run(["pex/Pex", "plask"],
  function(Pex, plask) {
    var Vec2 = Pex.Core.Vec2;
    var Edge = Pex.Core.Edge;
    var Line2D = Pex.Core.Line2D;
    var Triangle2D = Pex.Core.Triangle2D;

    Pex.Sys.Window.create({
      settings: {
        width: 1280,
        height: 720,
        type: '2d',
      },
      points: [],
      numPoints: 1000,
      init: function() {
        this.framerate(30);

        Pex.Util.RandUtils.seed(2);

        function randomPointInRect(x, y, w, h) {
          return new Vec2(x + Math.random() * w, y + Math.random() * h);
        }

        var center = new Vec2(this.width/2, this.height/2);
        for(var i=0; i<this.numPoints; i++) {
          var p = randomPointInRect(50, 50, this.width - 100, this.height - 100)
          if (p.distance(center) > this.height/2) { i--; continue; }
          this.points.push(p);
        }

        var self = this;
        this.on('leftMouseDown', function(e) {
          self.points.push(new Vec2(e.x, e.y));
        })
        this.on('mouseDragged', function(e) {
          self.points.push(new Vec2(e.x, e.y));
        })
        this.on('keyDown', function(e) {
          if (e.str == ' ') {
            self.points = [];
            self.edges = [];
          }
        })

        console.time("QuickHull " + this.points.length);
        this.quickHull(this.points);
        console.timeEnd("QuickHull " + this.points.length);
      },
      //http://en.wikipedia.org/wiki/QuickHull
      quickHull: function(points) {
        points.forEach(function(p) { p.used = 0; });

        if (points.length == 0) return;

        function notUsed(p) { return !p.used; }
        function neg(f) { return function(p) { return !f(p); } }

        var edgePoints = [];
        var edges = [];

        //find points with min and max
        var minX = 0;
        var maxX = 0;
        points.forEach(function(p, i) {
          if (p.x < points[minX].x) minX = i;
          if (p.x > points[maxX].x) maxX = i;
        })
        points[minX].used = 1;
        points[maxX].used = 1;
        var dividingLine = [minX, maxX];
        edgePoints.push(points[minX]);
        edgePoints.push(points[maxX]);
        edges.push([points[minX], points[maxX]]);

        function quickHullStep(points, edgePoints, dividingLine, depth) {
          function isLeft(line) { return function(p) { return line.isPointOnTheLeftSide(p); } }
          var leftPoints = points.filter(isLeft(dividingLine));
          var rightPoints = points.filter(neg(isLeft(dividingLine)));

          function findFurthestPoint(max, p) {
            var dist = dividingLine.distanceToPoint(p);
            if (max.verbose) console.log(p, dist);
            if (dist >= max.distance) {
              max.distance = dist;
              max.point = p;
            }
            return max;
          }

          function cleanSide(sidePoints, linePoint) {
            if (sidePoints.length == 0) return;
            var max = sidePoints.reduce(findFurthestPoint, { distance : 0, point : null })
            if (!max.point) {
              sidePoints.reduce(findFurthestPoint, { distance : 0, point : null, verbose: true })
              console.log(sidePoints);
            }
            max.point.used = 1;
            sidePoints.splice(sidePoints.indexOf(max.point), 1);
            edgePoints.push(max.point);
            var projectedMaxPoint = dividingLine.projectPoint(max.point);
            edges.push([max.point, projectedMaxPoint, 255]);
            edges.push([max.point, dividingLine.a, 100]);
            edges.push([max.point, dividingLine.b, 100]);
            var triangle = new Triangle2D(max.point, dividingLine.a, dividingLine.b);
            sidePoints.forEach(function(p) {
              if (triangle.contains(p)) {
                p.used = -1;
              }
            })

            sidePoints = sidePoints.filter(notUsed);

            var paLine = new Line2D(max.point, dividingLine.a);
            var paIsLeft = paLine.isPointOnTheLeftSide(projectedMaxPoint);
            var paPoints = sidePoints.filter(function(p) {
              return paLine.isPointOnTheLeftSide(p) != paIsLeft;
            })

            var pbLine = new Line2D(max.point, dividingLine.b);
            var pbIsLeft = pbLine.isPointOnTheLeftSide(projectedMaxPoint);
            var pbPoints = sidePoints.filter(function(p) {
              return pbLine.isPointOnTheLeftSide(p) == paIsLeft;
            })

            quickHullStep(paPoints, edgePoints, paLine, depth + 1);
            quickHullStep(pbPoints, edgePoints, pbLine, depth + 1);
          }

          cleanSide(leftPoints);
          cleanSide(rightPoints);
        }

        quickHullStep(points.filter(notUsed), edgePoints, new Line2D(points[minX], points[maxX]), 0);

        this.edges = edges;
      },
      draw: function() {
        var paint = this.paint;
        var canvas = this.canvas;
        var points = this.points;

        this.quickHull(this.points);

        function drawPoint(p) {
          paint.setFlags(paint.kAntiAliasFlag);
          paint.setStroke();
          paint.setStrokeWidth(2);
          var color = [255, 0, 0, 255];
          if (p.used == 1) color = [0, 0, 255, 255];
          if (p.used == -1) color = [0, 0, 0, 255];
          paint.setColor(color[0], color[1], color[2], color[3]);
          canvas.drawLine(paint, p.x - 3, p.y - 3, p.x + 3, p.y + 3);
          canvas.drawLine(paint, p.x + 3, p.y - 3, p.x - 3, p.y + 3);
        }
        function drawEdge(edge) {
          var a = edge[0];
          var b = edge[1];
          var alpha = edge[2];
          paint.setFlags(paint.kAntiAliasFlag);
          paint.setStroke();
          paint.setStrokeWidth(1);
          paint.setColor(0, 200, 0, alpha);
          canvas.drawLine(paint, a.x, a.y, b.x, b.y);
        }
        canvas.clear(250, 250, 220, 255);

        this.points.forEach(drawPoint);
        this.edges.forEach(drawEdge);
      }
    });
  }
);


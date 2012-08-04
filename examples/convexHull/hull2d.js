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
      numPoints: 100,
      init: function() {
        this.framerate(30);

        Pex.Util.RandUtils.seed(2);

        var bounds = new Pex.Core.Rect(50, 50, this.width - 100, this.height - 100);
        var center = new Vec2(this.width/2, this.height/2);

        for(var i=0; i<this.numPoints; i++) {
          var p = Pex.Util.RandUtils.randomVec2InRect(bounds);
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
        var dividingEdge = [points[minX], points[maxX]];
        edges.push(dividingEdge);

        function quickHullStep(points, edgePoints, dividingLine, dividingEdge, depth) {
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

          var numEdgePoints = edgePoints.length;

          function cleanSide(sidePoints, whereToPutNewEdges) {
            if (sidePoints.length == 0) return 0;

            var max = sidePoints.reduce(findFurthestPoint, { distance : 0, point : null })
            max.point.used = 1;
            sidePoints.splice(sidePoints.indexOf(max.point), 1);
            edgePoints.push(max.point);
            var projectedMaxPoint = dividingLine.projectPoint(max.point);
            var dividingEdgeA = [max.point, dividingLine.a, 100];
            var dividingEdgeB = [max.point, dividingLine.b, 100];
            edges.push(dividingEdgeA);
            edges.push(dividingEdgeB);

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

            var resultA = quickHullStep(paPoints, edgePoints, paLine, dividingEdgeA, depth + 1);
            var resultB = quickHullStep(pbPoints, edgePoints, pbLine, dividingEdgeB, depth + 1);

             if (paPoints.length > 0) edges.splice(edges.indexOf(dividingEdgeA), 1);
             if (pbPoints.length > 0) edges.splice(edges.indexOf(dividingEdgeB), 1);
          }

          var increasedSides = 0;

          cleanSide(leftPoints, "before");
          if (edgePoints.length > numEdgePoints) {
            numEdgePoints = edgePoints.length;
            increasedSides++;
          }

          cleanSide(rightPoints, "after");
          if (edgePoints.length > numEdgePoints) {
            numEdgePoints = edgePoints.length;
            increasedSides++;
          }

          if (increasedSides == 2 && dividingEdge != null) {
            var idx = edges.indexOf(dividingEdge);
            if (idx > -1) {
              edges.splice(idx, 1);
            }
          }

          return increasedSides;
        }

        var result = quickHullStep(points.filter(notUsed), edgePoints, new Line2D(points[minX], points[maxX]), dividingEdge, 0);
        if (result == 2) {
          if (dividingEdge != null) {
            var idx = edges.indexOf(dividingEdge);
            if (idx > -1) {
              edges.splice(idx, 1);
            }
          }
        }

        function swap(arr, i, j) {
          var tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }

        //ordering edges
        for(var i=0; i<edges.length; i++) {
          var edge = edges[i];
          var start = edge[0];
          var end = edge[1];
          for(var j=i+1; j<edges.length; j++) {
            var nextEdge = edges[j];
            if (nextEdge[0] == end) {
              swap(edges, i+1, j);
            }
            else if (nextEdge[1] == end) {
              swap(edges, i+1, j);
              var a = nextEdge[0];
              var b = nextEdge[1];
              nextEdge[0] = b;
              nextEdge[1] = a;
            }
          }
        }

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
        function drawEdge(edge, i) {
          var a = edge[0];
          var b = edge[1];
          var alpha = edge[2];
          paint.setFlags(paint.kAntiAliasFlag);
          paint.setStroke();
          paint.setStrokeWidth(1);
          paint.setColor(0, 200, 0, alpha);
          canvas.drawLine(paint, a.x, a.y, b.x, b.y);

          paint.setFill();
          paint.setColor(255, 0, 0, 255);
          canvas.drawText(paint, "" + i, (a.x + b.x)/2, (a.y + b.y)/2);
        }
        canvas.clear(250, 250, 220, 255);

        this.points.forEach(drawPoint);
        this.edges.forEach(drawEdge);
      }
    });
  }
);


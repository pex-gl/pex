var pex = require("../../build/pex");

var Rect = pex.geom.Rect;
var Vec2 = pex.geom.Vec2;
var Line2D = pex.geom.Line2D;
var Triangle2D = pex.geom.Triangle2D;

pex.sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '2d'
  },
  points: [],
  numPoints: 100,
  init: function() {
    pex.utils.MathUtils.seed(0);
    //Math.seedrandom(0);
    var bounds = new Rect(50, 50, this.width - 100, this.height - 100);
    var center = Vec2.fromValues(this.width/2, this.height/2);

    for(var i=0; i<this.numPoints; i++) {
      var p = pex.utils.MathUtils.randomVec2InRect(bounds);
      if (Vec2.distance(p, center) > this.height/2) { i--; continue; }
      this.points.push(p);
    }

    this.on('leftMouseDown', function(e) {
      this.points.push(Vec2.fromValues(e.x, e.y));
    }.bind(this));
    this.on('mouseDragged', function(e) {
      this.points.push(Vec2.fromValues(e.x, e.y));
    }.bind(this));
    this.on('keyDown', function(e) {
      if (e.str == ' ') {
        this.points = [];
        this.edges = [];
      }
    }.bind(this));

    this.quickHull(this.points);
  },
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
      if (p[0] < points[minX][0]) minX = i;
      if (p[0] > points[maxX][0]) maxX = i;
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
        var projectedMaxPoint = Vec2.create();
        dividingLine.projectPoint(projectedMaxPoint, max.point);
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
  drawPoint: function(p) {
    var paint = this.paint;
    var canvas = this.canvas;
    paint.setFlags(paint.kAntiAliasFlag);
    paint.setStroke();
    paint.setStrokeWidth(2);
    var color = [255, 0, 0, 255];
    if (p.used == 1) color = [0, 0, 255, 255];
    if (p.used == -1) color = [0, 0, 0, 255];
    paint.setColor(color[0], color[1], color[2], color[3]);
    canvas.drawLine(paint, p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3);
    canvas.drawLine(paint, p[0] + 3, p[1] - 3, p[0] - 3, p[1] + 3);
  },
  drawEdge: function(edge, i) {
    var paint = this.paint;
    var canvas = this.canvas;
    var a = edge[0];
    var b = edge[1];
    var alpha = edge[2];
    paint.setFlags(paint.kAntiAliasFlag);
    paint.setStroke();
    paint.setStrokeWidth(1);
    paint.setColor(0, 200, 0, alpha);
    canvas.drawLine(paint, a[0], a[1], b[0], b[1]);

    paint.setFill();
    paint.setColor(255, 0, 0, 255);
    canvas.drawText(paint, "" + i, (a[0] + b[0])/2, (a[1] + b[1])/2);
  },
  draw: function() {
    this.quickHull(this.points);

    this.canvas.clear(250, 250, 220, 255);

    this.points.forEach(this.drawPoint.bind(this));
    this.edges.forEach(this.drawEdge.bind(this));
  }
});

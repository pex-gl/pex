(function() {
  var Edge, Line2D, MathUtils, Rect, Triangle2D, Vec2, pex, sigstep, _ref;

  pex = require('../../build/pex');

  _ref = pex.geom, Rect = _ref.Rect, Vec2 = _ref.Vec2, Edge = _ref.Edge, Line2D = _ref.Line2D, Triangle2D = _ref.Triangle2D;

  MathUtils = pex.utils.MathUtils;

  sigstep = 1;

  pex.sys.Window.create({
    settings: {
      width: 640 * 0.75,
      height: 1136 * 0.75,
      type: '2d'
    },
    points: [],
    edges: [],
    numPoints: 100,
    init: function() {
      var bounds, center, i, p, _i, _ref1;
      pex.utils.MathUtils.seed(0);
      bounds = new Rect(this.width * 0.2, this.width * 0.2, this.width - this.width * 0.4, this.height - this.width * 0.4);
      center = new Vec2(this.width / 2, this.height / 2);
      for (i = _i = 0, _ref1 = this.numPoints - 1; _i <= _ref1; i = _i += 1) {
        p = MathUtils.randomVec2InRect(bounds);
        if (p.distance(center) > this.height / 2) {
          i--;
          continue;
        }
        this.points.push(p);
      }
      this.quickHull(this.points);
      this.on('leftMouseDown', (function(_this) {
        return function(e) {
          _this.points.push(Vec2.create(e.x, e.y));
          return _this.quickHull(_this.points);
        };
      })(this));
      this.on('mouseDragged', (function(_this) {
        return function(e) {
          _this.points.push(Vec2.create(e.x, e.y));
          return _this.quickHull(_this.points);
        };
      })(this));
      return this.on('keyDown', (function(_this) {
        return function(e) {
          if (e.str === ' ') {
            _this.points = [];
            _this.edges = [];
          }
          return _this.quickHull(_this.points);
        };
      })(this));
    },
    drawPoint: function(p) {
      var color;
      color = [255, 0, 0, 255];
      if (p.used === 1) {
        color = [0, 0, 255, 255];
      }
      if (p.used === -1) {
        color = [0, 0, 0, 255];
      }
      this.paint.setFlags(this.paint.kAntiAliasFlag);
      this.paint.setStroke();
      this.paint.setStrokeWidth(2);
      this.paint.setColor(color[0], color[1], color[2], color[3]);
      this.canvas.drawLine(this.paint, p.x - 3, p.y - 3, p.x + 3, p.y + 3);
      return this.canvas.drawLine(this.paint, p.x + 3, p.y - 3, p.x - 3, p.y + 3);
    },
    drawEdge: function(edge, i) {
      var a, alpha, b;
      a = edge.a;
      b = edge.b;
      alpha = 255;
      this.paint.setFlags(this.paint.kAntiAliasFlag);
      this.paint.setStroke();
      this.paint.setStrokeWidth(1);
      this.paint.setColor(0, 200, 0, alpha);
      this.canvas.drawLine(this.paint, a.x, a.y, b.x, b.y);
      this.paint.setFill();
      this.paint.setColor(255, 0, 0, 255);
      return this.canvas.drawText(this.paint, "" + i, (a.x + b.x) / 2, (a.y + b.y) / 2);
    },
    draw: function() {
      this.canvas.clear(250, 250, 220, 255);
      this.points.forEach(this.drawPoint.bind(this));
      return this.edges.forEach(this.drawEdge.bind(this));
    },
    quickHull: function(points) {
      var a, b, dividingEdge, dividingLine, edge, edgePoints, edges, end, i, isLeft, j, maxX, minX, neg, nextEdge, notUsed, quickHullStep, start, swap, _i, _j, _ref1, _ref2, _ref3;
      if (points.length === 0) {
        return;
      }
      points.forEach(function(p) {
        return p.used = 0;
      });
      notUsed = function(p) {
        return !p.used;
      };
      neg = function(f) {
        return function(p) {
          return !f(p);
        };
      };
      isLeft = function(line) {
        return function(p) {
          return line.isPointOnTheLeftSide(p);
        };
      };
      swap = function(arr, i, j) {
        var tmp;
        tmp = arr[i];
        arr[i] = arr[j];
        return arr[j] = tmp;
      };
      edgePoints = [];
      edges = [];
      minX = 0;
      maxX = 0;
      points.forEach(function(p, i) {
        if (p.x < points[minX].x) {
          minX = i;
        }
        if (p.x > points[maxX].x) {
          return maxX = i;
        }
      });
      points[minX].used = 1;
      points[maxX].used = 1;
      dividingLine = new Line2D(points[minX], points[maxX]);
      edgePoints.push(points[minX]);
      edgePoints.push(points[maxX]);
      dividingEdge = new Edge(points[minX], points[maxX]);
      quickHullStep = function(points, edgePoints, dividingLine, dividingEdge, depth) {
        var cleanSide, findFurthestPoint, leftPoints, numEdgePoints, rightPoints;
        leftPoints = points.filter(isLeft(dividingLine));
        rightPoints = points.filter(neg(isLeft(dividingLine)));
        numEdgePoints = edgePoints.length;
        findFurthestPoint = function(max, p) {
          var dist;
          dist = dividingLine.distanceToPoint(p);
          if (dist >= max.distance) {
            max.distance = dist;
            max.point = p;
          }
          return max;
        };
        cleanSide = function(sidePoints, left) {
          var dividingEdgeA, dividingEdgeB, max, paLine, paPoints, pbLine, pbPoints, projectedMaxPoint, resultA, resultB, triangle;
          if (sidePoints.length === 0) {
            return 0;
          }
          max = sidePoints.reduce(findFurthestPoint, {
            distance: 0,
            point: null
          });
          max.point.used = 1;
          sidePoints.splice(sidePoints.indexOf(max.point), 1);
          edgePoints.push(max.point);
          projectedMaxPoint = dividingLine.projectPoint(max.point);
          dividingEdgeA = new Edge(dividingLine.a, max.point);
          dividingEdgeB = new Edge(dividingLine.b, max.point);
          edges.push(dividingEdgeA);
          edges.push(dividingEdgeB);
          triangle = new Triangle2D(max.point, dividingLine.a, dividingLine.b);
          sidePoints.forEach(function(p) {
            if (triangle.contains(p)) {
              return p.used = -1;
            }
          });
          sidePoints = sidePoints.filter(notUsed);
          paLine = new Line2D(dividingLine.a, max.point);
          paPoints = sidePoints.filter(function(p) {
            return paLine.isPointOnTheLeftSide(p) === left;
          });
          pbLine = new Line2D(dividingLine.b, max.point);
          pbPoints = sidePoints.filter(function(p) {
            return pbLine.isPointOnTheLeftSide(p) !== left;
          });
          resultA = quickHullStep(paPoints, edgePoints, paLine, dividingEdgeA, depth + 1);
          resultB = quickHullStep(pbPoints, edgePoints, pbLine, dividingEdgeB, depth + 1);
          if (paPoints.length > 0) {
            edges.splice(edges.indexOf(dividingEdgeA), 1);
          }
          if (pbPoints.length > 0) {
            return edges.splice(edges.indexOf(dividingEdgeB), 1);
          }
        };
        cleanSide(leftPoints, true);
        if (edgePoints.length > numEdgePoints) {
          numEdgePoints = edgePoints.length;
        }
        cleanSide(rightPoints, false);
        if (edgePoints.length > numEdgePoints) {
          return numEdgePoints = edgePoints.length;
        }
      };
      quickHullStep(points.filter(notUsed), edgePoints, dividingLine, dividingEdge, 0);
      for (i = _i = 0, _ref1 = edges.length - 1; _i <= _ref1; i = _i += 1) {
        edge = edges[i];
        start = edge.a;
        end = edge.b;
        for (j = _j = _ref2 = i + 1, _ref3 = edges.length - 1; _j <= _ref3; j = _j += 1) {
          nextEdge = edges[j];
          if (nextEdge.a === end) {
            swap(edges, i + 1, j);
          } else if (nextEdge.b === end) {
            swap(edges, i + 1, j);
            a = nextEdge.a;
            b = nextEdge.b;
            nextEdge.a = b;
            nextEdge.b = a;
          }
        }
      }
      return this.edges = edges;
    }
  });

}).call(this);

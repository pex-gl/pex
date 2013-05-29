define(['pex/geom/Line2D', 'pex/geom/Vec2'], function(Line2D, Vec2) {

  //Based on http://www.mathopenref.com/coordpolygonarea.html
  //and http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
  //`vertices` - should be counter-clockwise
  function signedPolygon2DArea(vertices) {
    var sum = 0;
    var n = vertices.length;

    for(var i=0; i<n; i++) {
      var v = vertices[i];
      var nv = vertices[(i+1) % n];
      sum += v.x * nv.y - v.y * nv.x;
    }

    return sum * 0.5;
  }

  function Polygon2D(vertices) {
    this.vertices = vertices || [];
    this.center = Vec2.create();
  }

  Polygon2D.prototype.getArea = function() {
    return Math.abs(signedPolygon2DArea(this.vertices));
  }

  Polygon2D.prototype.isClockwise = function() {
    return signedPolygon2DArea(this.vertices) > 0;
  }

  Polygon2D.prototype.flipVertexOrder = function() {
    this.vertices.reverse();
  }

  Polygon2D.prototype.getCenter = function() {
    this.center.x = 0;
    this.center.y = 0;
    for(var i=0; i<this.vertices.length; i++) {
      this.center.x += this.vertices[i].x;
      this.center.y += this.vertices[i].y;
    }

    this.center.x /= this.vertices.length;
    this.center.y /= this.vertices.length;

    return this.center;
  }

  Polygon2D.prototype.clip = function(clippingPolygon2D) {
    var clippedVertices = [];
    var vertices = this.vertices;

    var numClippingEdges = clippingPolygon2D.vertices.length;

    for(var i=0; i<numClippingEdges; i++) {
      var clippingEdge = new Line2D(clippingPolygon2D.vertices[i], clippingPolygon2D.vertices[(i+1)%numClippingEdges]);
      for(var j=0; j<vertices.length; j++) {
        var start = vertices[(j - 1 + vertices.length) % vertices.length];
        var end = vertices[j];
        var isStartInside = clippingEdge.isPointOnTheLeftSide(start);
        var isEndInside = clippingEdge.isPointOnTheLeftSide(end);
        //console.log(start, end);
        if (isStartInside && isEndInside) {
          clippedVertices.push(end);
          prevStart = end;
        }
        else if (isStartInside && !isEndInside) {
          intersection = clippingEdge.intersect(new Line2D(start, end));
          clippedVertices.push( intersection );
        }
        else if (!isStartInside && !isEndInside) {
          //do nothing
          prevStart = null;
        }
        else if (!isStartInside && isEndInside) {
          var intersection = clippingEdge.intersect(new Line2D(start, end));
          clippedVertices.push( intersection );
          clippedVertices.push( end );
        }
      }
      vertices = clippedVertices;
      clippedVertices = [];
    }

    return new Polygon2D(vertices);
  }

  return Polygon2D;
});
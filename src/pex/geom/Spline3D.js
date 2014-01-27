//Camtull-Rom spline implementation  
//Inspired by code from [Tween.js][1]
//[1]: http://sole.github.com/tween.js/examples/05_spline.html

//## Example use 
//
//     var points = [ 
//       new Vec3(-2,  0, 0), 
//       new Vec3(-1,  0, 0), 
//       new Vec3( 1,  1, 0), 
//       new Vec3( 2, -1, 0) 
//     ];
//
//     var spline = new Spline3D(points);
//
//     spline.getPointAt(0.25);

//## Reference

define(['pex/geom/Vec3'], function(Vec3) {

  //### Spline3D ( points, [ loop ] )
  //`points` - *{ Array of Vec3 }* = [ ]  
  //`loop` - is the spline a connected loop? *{ Boolean }* = false
  function Spline3D(points, loop) {
    this.points = points || [];
    this.dirtyLength = true;
    this.loop = loop || false;
    this.samplesCount = 100;
  }

  //### getPoint ( t )
  //Gets position based on t-value.
  //It is fast, but resulting points will not be evenly distributed.
  //
  //`t` - *{ Number } <0, 1>*
  Spline3D.prototype.getPoint = function ( t ) {
    if (this.loop) {
      t = (t + 1 ) % 1;
    }
    else {
      t = Math.max(0, Math.min(t, 1));
    }

    var points = this.points;
    var len = this.loop ? points.length : points.length - 1;
    var point = t * len;
    var intPoint = Math.floor( point );
    var weight = point - intPoint;

    var c0, c1, c2, c3;
    if (this.loop) {
      c0 = (intPoint - 1 + points.length ) % points.length;
      c1 = intPoint % points.length;
      c2 = (intPoint + 1 ) % points.length;
      c3 = (intPoint + 2 ) % points.length;
    }
    else {
      c0 = intPoint == 0 ? intPoint : intPoint - 1;
      c1 = intPoint;
      c2 = intPoint > points.length - 2 ? intPoint : intPoint + 1;
      c3 = intPoint > points.length - 3 ? intPoint : intPoint + 2;
    }

    var vec = new Vec3();
    vec.x = this.interpolate( points[ c0 ].x, points[ c1 ].x, points[ c2 ].x, points[ c3 ].x, weight );
    vec.y = this.interpolate( points[ c0 ].y, points[ c1 ].y, points[ c2 ].y, points[ c3 ].y, weight );
    vec.z = this.interpolate( points[ c0 ].z, points[ c1 ].z, points[ c2 ].z, points[ c3 ].z, weight );

    return vec;
  }

  //### addPoint ( p )
  //Adds point to the spline
  //
  //`p` - point to be added *{ Vec3 }* 
  Spline3D.prototype.addPoint = function ( p ) {
    this.dirtyLength = true;
    this.points.push(p)
  }

  //### getPointAt ( d )
  //Gets position based on d-th of total length of the curve.
  //Precise but might be slow at the first use due to need to precalculate length.
  //
  //`d` - *{ Number } <0, 1>*
  Spline3D.prototype.getPointAt = function ( d ) {
    if (this.loop) {
      d = (d + 1 ) % 1;
    }
    else {
      d = Math.max(0, Math.min(d, 1));
    }

    if (this.dirtyLength) {
      this.precalculateLength();
    }

    //TODO: try binary search
    var k = 0;
    for(var i=0; i<this.accumulatedLengthRatios.length; i++) {
      if (this.accumulatedLengthRatios[i] >= d) {
        k = this.accumulatedRatios[i];
        break;
      }
    }

    return this.getPoint(k);
  }

  //### getPointAtIndex ( i )
  //Returns position of i-th point forming the curve
  //
  //`i` - *{ Number } <0, Spline3D.points.length)*
  Spline3D.prototype.getPointAtIndex = function ( i ) {
    if (i < this.points.length) {
      return this.points[i];
    }
    else {
      return null;
    }
  }

  //### getNumPoints ( )
  //Return number of base points in the spline
  Spline3D.prototype.getNumPoints = function() {
    return this.points.length;
  }

  //### getLength ( )
  //Returns the total length of the spline.
  Spline3D.prototype.getLength = function() {
    if (this.dirtyLength) {
      this.precalculateLength();
    }
    return this.length;
  }

  //### precalculateLength ( )
  //Goes through all the segments of the curve and calculates total length and
  //the ratio of each segment.
  Spline3D.prototype.precalculateLength = function() {
    var step = 1/this.samplesCount;
    var k = 0;
    var totalLength = 0;
    this.accumulatedRatios = [];
    this.accumulatedLengthRatios = [];
    this.accumulatedLengths = [];

    var point;
    var prevPoint;
    for(var i=0; i<this.samplesCount; i++) {
      prevPoint = point;
      point = this.getPoint(k);

      if (i > 0) {
        var len = point.dup().sub(prevPoint).length();
        totalLength += len;
      }

      this.accumulatedRatios.push(k);
      this.accumulatedLengths.push(totalLength)

      k += step;
    }

    for(var i=0; i<this.samplesCount; i++) {
      this.accumulatedLengthRatios.push(this.accumulatedLengths[i] / totalLength);
    }

    this.length = totalLength;
    this.dirtyLength = false;
  }

  //### close ( )
  //Closes the spline. It will form a loop now.
  Spline3D.prototype.close = function( ) {
    this.loop = true;
  }

  //### isClosed ( )
  //Returns true if spline is closed (forms a loop) *{ Boolean }*
  Spline3D.prototype.isClosed = function() {
    return this.loop;
  }

  //### interpolate ( p0, p1, p2, p3, t)
  //Helper function to calculate Catmul-Rom spline equation  
  //
  //`p0` - previous value *{ Number }*  
  //`p1` - current value *{ Number }*  
  //`p2` - next value *{ Number }*  
  //`p3` - next next value *{ Number }*  
  //`t` - parametric distance between p1 and p2 *{ Number } <0, 1>*
  Spline3D.prototype.interpolate = function(p0, p1, p2, p3, t) {
    var v0 = ( p2 - p0 ) * 0.5;
    var v1 = ( p3 - p1 ) * 0.5;
    var t2 = t * t;
    var t3 = t * t2;
    return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;
  }

  return Spline3D;
})
//Extrudes circle along given spline using Parallel Transport Frame

//## Parent class : [Geometry](../core/Geometry.html)

//## Example use 
//
//     var points = [ 
//       new Core.Vec3(-2,  0, 0), 
//       new Core.Vec3(-1,  0, 0), 
//       new Core.Vec3( 1,  1, 0), 
//       new Core.Vec3( 2, -1, 0) 
//     ];
//
//     var spline = new Spline(points);
//     var loft = new Loft(spline);
//     var loftMesh = new Mesh(loft, new Materials.TestMaterial());
//
//## Reference

define([
  "pex/core/Vec2",
  "pex/core/Vec3",
  "pex/core/Vec4",
  "pex/core/Color",
  "pex/core/Mat4",
  "pex/core/Edge",
  "pex/core/Face3",
  "pex/core/Geometry",
  "pex/geom/Path",
  "pex/util/ObjUtils"
  ],
  function(Vec2, Vec3, Vec4, Color, Mat4, Edge, Face3, Geometry, Path, ObjUtils) {

  //###Loft ( path, options )
  //`path` - curve along extrusion will occur *{ Spline }*  
  //`options` - *{ Object }*  
  //
  //Default options:  
  //`numSteps` - number of curve steps *{ Number/Int }* = 200  
  //`numSegments` - number of circle segments *{ Number/Int }* = 8  
  //`r` - radius *{ Number }*  = 0.5  
  //`lineBuilder` - debug lines *{ LineBuilder }* = null  
  //`shapePath` - shape to be extruded *{ Path }* = null  
  //
  //Note: If shapePath is null a circle with numSegments and radius r will be created.  
  //Note: Shape path has to be on the XY plane to be extruded properly.  
  function Loft(path, options) {
    var defaults = {
      numSteps: 200,
      numSegments: 8,
      r: 0.05,
      lineBuilder: null,
      shapePath: null
    };

    options = ObjUtils.mergeObjects(defaults, options);

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];
    this.faces = [];
    this.edges = [];

    lineBuilder = options.lineBuilder;
    var numSteps = options.numSteps;
    var numSegments = options.numSegments;
    var r = options.r;

    var index = 0;

    var points = this.computePoints(path, numSteps);
    var tangents = this.computeTangents(path, numSteps);
    var frame = null;

    var totalRotation = ptCalcRotation(numSteps, points, tangents);
    var stepRotation = totalRotation * 1/(numSteps);

    var baseRight = new Vec3(0.05,0,0);
    var baseUp = new Vec3(0,0.05,0);
    var baseForward = new Vec3(0,0,0.05);
    var center;

    var shapePath = options.shapePath;
    if (!shapePath) {
      shapePath = new Path();
      for(var i=0; i<numSegments; i++) {
        var a = i/numSegments * 2 * Math.PI;
        var p = new Vec3(r * Math.cos(a), r * Math.sin(a), 0);
        shapePath.addPoint(p);
      }
      shapePath.close();
    }

    numSegments = shapePath.vertices.length

    for(var i=0; i<=numSteps; i++) {
      if (i == 0) {
        frame = ptFirstFrame(points[0], points[1], tangents[0]);
      }
      else {
        frame = ptNextFrame(frame, points[i-1], points[i], tangents[i-1], tangents[i], stepRotation);
      }

      var right = frame.mulVec3(baseRight);
      var up = frame.mulVec3(baseUp);
      var forward = frame.mulVec3(baseForward);

      center = path.getPointAt(i/numSteps);

      if (lineBuilder) lineBuilder.addLine(center, forward, Color.Red);
      if (lineBuilder) lineBuilder.addLine(center, up, Color.Pink);
      if (lineBuilder) lineBuilder.addLine(center, right, Color.Yellow);

      for(var j=0; j<=numSegments; j++) {
        var p = shapePath.vertices[j % numSegments];
        p = frame.mulVec3(p);

        this.vertices.push(p);
        this.texCoords.push(new Vec2(j/numSegments, i/numSteps));
        this.normals.push(p.subbed(center).normalize());

        /*     95         40             n+j+s+1  -  n+j+1+s+1
         *   8   6      3   1            |           |
         *    7          2              n+j      -  n+j+1 
         */
        if (i < numSteps && j < numSegments) {
           this.faces.push(new Face3(index + j, index + j + 1, index + j + (numSegments + 1)));
           this.faces.push(new Face3(index + j + (numSegments + 1), index + j + 1, index + j + 1 + (numSegments + 1)));

           this.edges.push(new Edge(index + j, index + j + 1));
           this.edges.push(new Edge(index + j + 1, index + j + (numSegments + 1)));
           this.edges.push(new Edge(index + j, index + j + (numSegments + 1)));
         }
      }

      index += numSegments + 1;
    }
  }

  Loft.prototype = new Geometry();

  //### computePoints ( path, numSteps )
  //Calculates points on the curve used as a base for building orientation frames.  
  //
  //`path` - curve to sample from *{ Spline }*  
  //`numSteps` - number of points to sample *{ Number/Int }*
  Loft.prototype.computePoints = function(path, numSteps) {
    var points = [];
    for(var i=0; i<=numSteps; i++) {
      points.push(path.getPointAt(i/numSteps));
    }
    return points;
  }

  //### computeTangents ( path, numSteps )
  //Calculates tantents of the path at the same positions as points from computePoints method.
  //
  //`path` - curve to sample from *{ Spline }*  
  //`numSteps` - number of points to sample *{ Number/Int }*
  Loft.prototype.computeTangents = function(path, numSteps) {
    var tangents = [];
    for(var i=0; i<=numSteps; i++) {
      var prevPos = path.getPointAt((i-0.1)/(numSteps));
      var nextPos = path.getPointAt((i+0.1)/(numSteps));
      if (lineBuilder) {
        var currPos = path.getPointAt((i  )/(numSteps));
        lineBuilder.addLine(prevPos, currPos, Color.Grey);
      }
      var t = nextPos.subbed(prevPos);
      t.normalize();
      tangents.push(t);
    }
    return tangents;
  }

  //## Private methods and variables

  //### lineBuilder
  //Line builder instance used for drawing debug lines.
  var lineBuilder;

  //### ptFirstFrame ( first_pnt, second_pnt, first_tan)
  //Calculates the first frame of parallel transport frame sequence.  
  //
  //`first_pnt` - first point *{ Vec3 }*  
  //`second_pnt` - seconds point *{ Vec3 }*   
  //`first_tan` - first tangent *{ Vec3 }*
  var ptFirstFrame = function(first_pnt, second_pnt, first_tan){
    var n = first_tan.dup().cross(second_pnt.subbed(first_pnt));
    if(n.lengthSquared() === 0){
      var atx = Math.abs(first_tan.x);
      var aty = Math.abs(first_tan.y);
      var atz = Math.abs(first_tan.z);
      if (atz < atx && atz <= aty) {
        n = first_tan.dup().cross(new Vec3(0, 0, 1)); //first_tan.z
      }
      else if(aty > atx && aty >= atz) {
        n = first_tan.dup().cross(new Vec3(0, 1, 0)); //first_tan.y
      }
      else {
        n = first_tan.dup().cross(new Vec3(1, 0, 0)); //first_tan.x
      }
    }

    n.normalize();

    var b = first_tan.dup().cross(n);

    return new Mat4().set4x4r(
        b.x, n.x, first_tan.x, first_pnt.x,
        b.y, n.y, first_tan.y, first_pnt.y,
        b.z, n.z, first_tan.z, first_pnt.z,
          0,   0,           0,           1
    );
  };

  //### ptRotationSum
  //Sum of rotation along the curve causing offset between the first and the last frame.
  var ptRotationSum = 0;

  //### ptNextFrame ( prev_mtx, prev_pnt, current_pnt, prev_tan, current_tan, stepRotation )
  //Calculates next frame of parallel transport frame sequence.  
  //
  //`prev_mtx` - previous frame *{ Mat4 }*  
  //`prev_pnt` - previous point *{ Vec3 }*  
  //`current_pnt` - current point *{ Vec3 }*  
  //`prev_tan` - previous tangent *{ Vec3 }*  
  //`current_tan` - current tangent *{ Vec3 }*  
  //`stepRotation` - rotation used to compensate for curve twist *{ Number }* = 0
  //
  //*Note: stepRotation values comes from ptCalcRotation() divided by number of sampled points.*
  var ptNextFrame = function(prev_mtx, prev_pnt, current_pnt, prev_tan, current_tan, stepRotation){
      var theta = Math.acos(prev_tan.dot(current_tan));
      var axis = prev_tan.dup().cross(current_tan);

      if(theta > 0.0001 && axis.lengthSquared() !== 0){
          axis.normalize();

          if (stepRotation == 0) {
            ptRotationSum += theta;
          }

          return new Mat4()
              .translate(current_pnt.x, current_pnt.y, current_pnt.z)
              .rotate(-stepRotation, current_tan.x, current_tan.y, current_tan.z)
              .rotate(theta, axis.x, axis.y, axis.z)
              .translate(-prev_pnt.x, -prev_pnt.y, -prev_pnt.z)
              .mul(prev_mtx);
      }
      return new Mat4()
          .translate(current_pnt.x - prev_pnt.x, current_pnt.y - prev_pnt.y, current_pnt.z - prev_pnt.z)
          .mul(prev_mtx);
  };

  //### ptCalcRotation ( numSteps, points, tangents )
  //Calculates rotation difference between the first and the last frame.  
  //
  //*Note: Used to calculate value of stepRotation in ptNextFrame().*
  var ptCalcRotation = function(numSteps, points, tangents) {
    var frame;
    var firstFrame;
    var baseUp = new Vec3(0, 1, 0);
    for(var i=0; i<=numSteps; i++) {
      if (i == 0) {
        frame = ptFirstFrame(points[0], points[1], tangents[0]);
        firstFrame = frame.dup();
      }
      else {
        frame = ptNextFrame(frame, points[i-1], points[i], tangents[i-1], tangents[i], 0);
      }
    }
    var lastCenter = points[points.length - 1];
    var firstBase = firstFrame.mulVec3(baseUp).sub(lastCenter).normalize();
    var lastBase = frame.mulVec3(baseUp).sub(lastCenter).normalize();
    var fdotl = Math.max(0, Math.min(firstBase.dot(lastBase), 1.0));
    var angle = Math.acos(fdotl);
    return angle;
  }

  return Loft;
})
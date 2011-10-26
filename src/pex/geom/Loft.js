//     4          0              n + j + s  -  n + (j + 1) % s + s
//   7   5      3   1            |             |
//     6          2              n + j      -  n + (j + 1) % s

define([
  "pex/core/Vec2",
  "pex/core/Vec3",
  "pex/core/Vec4",
  "pex/core/Color",
  "pex/core/Mat4",
  "pex/core/Edge",
  "pex/core/Face3",
  "pex/geom/Geometry"
  ],
  function(Vec2, Vec3, Vec4, Color, Mat4, Edge, Face3, Geometry) {

  var ptFirstFrame = function(first_pnt, second_pnt, first_tan){
      var n = first_tan.dup().cross(second_pnt.subbed(first_pnt));
      if (n.lengthSquared() === 0) {
          var atx = Math.abs(first_tan.x);
          var aty = Math.abs(first_tan.y);
          var atz = Math.abs(first_tan.z);
          if(atz < atx && atz < aty)
              n = first_tan.dup().cross(new Vec3(0, 0, first_tan.z));
          else if(aty > atx && aty > atz)
              n = first_tan.dup().cross(new Vec3(0, first_tan.y, 0));
          else
              n = first_tan.dup().cross(new Vec3(first_tan.x, 0, 0));
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

  var ptRotationSum = 0;

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

  var ptCalcRotation = function(numSteps, points, tangents) {
    var frame;
    var firstFrame;
    var baseUp = new Vec3(0, 1, 0);
    for(var i=0; i<numSteps; i++) {
      if (i == 0) {
        frame = ptFirstFrame(points[0], points[1], tangents[0]);
        firstFrame = frame.dup();
      }
      else {
        frame = ptNextFrame(frame, points[i-1], points[i], tangents[i-1], tangents[i], 0);
      }
    }
    var firstBase = firstFrame.mulVec3(baseUp).sub(points[i]).normalize();
    var lastBase = frame.mulVec3(baseUp).sub(points[i]).normalize();
    var a = firstBase.dot(lastBase);
    a = Math.acos(a);
    return a;
  }

  function Loft(path) {
    this.vertices = [];
    this.texCoords = [];
    this.faces = [];
    this.edges = [];

    var numSteps = 150;
    var numSegments = 8;
    var r = 0.1;

    var index = 0;

    var points = this.computePoints(path, numSteps);
    var tangents = this.computeTangents(path, numSteps);
    var frame = 0;
    var firstFrame = 0;//temp;

    var totalRotation = ptCalcRotation(numSteps, points, tangents);
    var stepRotation = totalRotation * 1/numSteps;

    var baseRight = new Vec3(0.05,0,0);
    var baseUp = new Vec3(0,0.05,0);
    var baseForward = new Vec3(0,0,0.05);
    var center;
    for (var i=0; i<numSteps; i++) {
      if (i == 0) {
        frame = ptFirstFrame(points[0], points[1], tangents[0]);
      }
      else {
        frame = ptNextFrame(frame, points[i-1], points[i], tangents[i-1], tangents[i], stepRotation);
      }

      var right = frame.mulVec3(baseRight);
      var up = frame.mulVec3(baseUp);
      var forward = frame.mulVec3(baseForward);

      center = path.getPointAt(i/(numSteps-1));

      for(var j=0; j<numSegments; j++) {
        var a = j/numSegments * 2 * Math.PI;

        var p = new Vec3(r * Math.cos(a), r * Math.sin(a), 0);
        p = frame.mulVec3(p);

        this.vertices.push(p);
        this.texCoords.push(new Vec2(j/numSegments, i/numSteps));

        if (i < numSteps - 2) {
          this.faces.push(new Face3(index + j, index + (j + 1 ) % numSegments, index + j + numSegments));
          this.faces.push(new Face3(index + j + numSegments, index + (j + 1 ) % numSegments, index + (j + 1 ) % numSegments + numSegments));

          this.edges.push(new Edge(index + j, index + (j + 1 ) % numSegments));
          this.edges.push(new Edge(index + (j + 1 ) % numSegments, index + j + numSegments));
          this.edges.push(new Edge(index + j, index + j + numSegments));
        }
        else if (i < numSteps - 1) {
          this.faces.push(new Face3(index + j, index + (j + 1 ) % numSegments, j));
          this.faces.push(new Face3(j, index + (j + 1 ) % numSegments, (j + 1 ) % numSegments));

          this.edges.push(new Edge(index + j, index + (j + 1 ) % numSegments));
          this.edges.push(new Edge(index + (j + 1 ) % numSegments, j));
          this.edges.push(new Edge(index + j, j));
        }
      }

      index += numSegments;
    }

    this.computeNormals();
  }

  Loft.prototype = new Geometry();

  Loft.prototype.computePoints = function(path, numSteps) {
    var points = [];
    for(var i=0; i<=numSteps; i++) {
      points.push(path.getPointAt((i  )/(numSteps-1)));
    }
    return points;
  }

  Loft.prototype.computeTangents = function(path, numSteps) {
    var tangents = [];
    for(var i=0; i<=numSteps; i++) {
      var prevPos = path.getPointAt((i-0.1)/(numSteps-1));
      var nextPos = path.getPointAt((i+0.1)/(numSteps-1));
      var t = nextPos.subbed(prevPos);
      t.normalize();
      tangents.push(t);
    }
    return tangents;
  }

  return Loft;
})
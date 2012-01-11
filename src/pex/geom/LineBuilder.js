//Helper class to build geometries made out of lines.

//## Parent class : [Geometry](../core/Geometry.html)

//## Example use
//     var lineBuilder = new LineBuilder();
//     lineBuilder.addLine(new Vec3(-1,0,0), new Vec3(1,0,0));
//     lineBuilder.addLine(new Vec3(0,-1,0), new Vec3(0,1,0));
//     lineBuilder.addCircle(new Vec3(0,0,0), 0.5, Color.Red);
//     
//     var mesh = new Mesh(
//       lineBuilder, 
//       new Materials.TestMaterial(), 
//       { useEdges : true }
//     );

//## Reference
define([
  "pex/core/Vec3",
  "pex/core/Vec4",
  "pex/core/Edge",
  "pex/core/Mat4",
  "pex/core/Color",
  "pex/core/Geometry"
], 
  function(Vec3, Vec4, Edge, Mat4, Color, Geometry) {
  //### LineBuilder ( )
  function LineBuilder() {
    this.vertices = [];
    this.colors = [];
    this.edges = [];
    this.vertexCount = 0;

    this.reset();
  }

  LineBuilder.prototype = new Geometry();
  
  //### reset ( )
  //Clears all the lines added to the builder.
  LineBuilder.prototype.reset = function() {
    this.vertices = [];
    this.colors = [];
    this.edges = [];
    this.vertexCount = 0;     
  }

  //### addLine ( pos1, pos2 , color1, color2 )
  //Adds a line segment between two points.  
  //
  //`pos1` - beginning of the line *{ Vec3 }*  
  //`pos2` - end of the line *{ Vec3 }*  
  //`color1` - color at the beginning of the line *{ Color }* = Optional  
  //`color2` - color at the end of the line *{ Color }* = Optional  
  //
  //*Note: If only color1 is specified then color2 defaults to the same value and whole line will have the same one color.* 
  LineBuilder.prototype.addLine = function(pos1, pos2, color1, color2) {
    this.vertices.push(pos1);
    this.vertices.push(pos2);

    if (color1 && !color2) color2 = color1;
    if (color1) this.colors.push(color1);
    if (color2) this.colors.push(color2);
    this.edges.push(new Edge(this.vertexCount, this.vertexCount + 1));
    this.vertexCount += 2;
  }

  //### addPath ( positions, colors)
  //Adds series of line segments between multiple points. 
  // 
  //`positions` - *{ Array of Vec3 }*  
  //`colors` - *{ Array of Color }* = null
  LineBuilder.prototype.addPath = function(positions, colors) {
    for(var i=0; i<positions.length; i++) {
      this.vertices.push(positions[i]);

      if (colors) {
        this.colors.push(colors[i]);
      }

      if (i > 0) {
        this.edges.push(new Edge(this.vertexCount + i - 1, this.vertexCount + i));
      }
    }

    this.vertexCount += positions.length;
  }

  //### addGizmo ( pos, r, color )
  //Adds a gizmo - three circles, each one aligned with X, Y or Z axis. 
  // 
  //`pos` - position *{ Vec3 }*  
  //`r` - radius *{ Number }*  
  //`color` - position *{ Color }* = null
  LineBuilder.prototype.addGizmo = function(pos, r, color) {
    for(var k=0; k<3; k++) {
      var m = new Mat4();
      if (k == 1) m.rotate(Math.PI/2, 0, 1, 0);
      if (k == 2) m.rotate(Math.PI/2, 1, 0, 0);
      for(var i=0; i<36; i++) {
        var dpos = new Vec3(r * Math.cos(Math.PI * 2 * i / 36), r * Math.sin(Math.PI * 2 * i / 36), 0);      
        dpos = m.mulVec3(dpos);
        var p = pos.added(dpos);
        this.vertices.push(p);
        if (color) this.colors.push(color);
        this.edges.push(new Edge(this.vertexCount + i, this.vertexCount + (i + 1) % 36));
      }
      this.vertexCount += 36;
    }
  }

  LineBuilder.prototype.addPlane = function(pos, normal, up, r, color) {
    var front = normal;
    var right = up.crossed(front);
    var nLines = 20;
    for(var i=0; i<nLines; i++) {
      var f = r * (-1 + 2*i/(nLines-1));
      this.addLine(pos.subbed(right.scaled(r)).added(up.scaled(f)), pos.added(right.scaled(r)).added(up.scaled(f)), color);
      this.addLine(pos.added(right.scaled(f)).subbed(up.scaled(r)), pos.added(right.scaled(f)).added(up.scaled(r)), color);
    }
  }

  //### addCircle ( pos, r, color )
  //Adds a circle.
  // 
  //`pos` - position *{ Vec3 }*  
  //`r` - radius *{ Number }*  
  //`color` - line color *{ Color }* = null  
  //`transform` - transformation matrix *{ Mat4 }* = null
  //
  //*Note: transform is useful e.g. for making screen aligned circles in 3d space.*
  LineBuilder.prototype.addCircle = function(pos, r, color, transform) {
    for(var i=0; i<36; i++) {
      var dpos = new Vec3(r * Math.cos(Math.PI * 2 * i / 36), r * Math.sin(Math.PI * 2 * i / 36), 0);
      if (transform) {
        dpos = transform.multVec3(dpos);
      }
      var p = pos.added(dpos);
      this.vertices.push(p);
      if (color) this.colors.push(color);
      this.edges.push(new Edge(this.vertexCount + i, this.vertexCount + (i + 1) % 36));
    }
    this.vertexCount += 36;
  }

  //### addRect ( pos, width, height, color, transform, corner )
  //Adds a rectangle.
  //
  //`pos` - position *{ Vec3 }*  
  //`width` - width *{ Number }*  
  //`height` - width *{ Number }*  
  //`color` - line color *{ Color }* = null  
  //`transform` - transformation matrix *{ Mat4 }* = null
  //`center` - is position the center or a top left corner of the rect = *{ Boolean }* false (corner)
  //
  //*Note: transform is useful e.g. for making screen aligned rectangles in 3d space.*
  LineBuilder.prototype.addRect = function(pos, width, height, color, transform, center) {
    var points = [];

    if (center) {
      points.push(new Vec3(-width/2, -height/2, 0));
      points.push(new Vec3( width/2, -height/2, 0));
      points.push(new Vec3( width/2,  height/2, 0));
      points.push(new Vec3(-width/2,  height/2, 0));
    }
    else {
      points.push(new Vec3(0, 0, 0));
      points.push(new Vec3(width, 0, 0));
      points.push(new Vec3(width, height, 0));
      points.push(new Vec3(0, height, 0));
    }

    for(var i=0; i<4; i++) {
      var d = points[i];
      if (transform) d = transform.multVec3(d);
      this.vertices.push(pos.added(d));
      if (color) this.colors.push(color);
    }

    this.edges.push(new Edge(this.vertexCount + 0, this.vertexCount + 1));
    this.edges.push(new Edge(this.vertexCount + 1, this.vertexCount + 2));
    this.edges.push(new Edge(this.vertexCount + 2, this.vertexCount + 3));
    this.edges.push(new Edge(this.vertexCount + 3, this.vertexCount + 0));

    this.vertexCount += 4;
  }

  return LineBuilder;
})
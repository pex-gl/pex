define([
  'pex/geom/Geometry',
  'pex/geom/Vec3',
  'pex/geom/Vec3Array',
  'pex/geom/Vec3',
  'pex/geom/Vec3Array'],
  function(Geometry, Vec3, Vec3Array, Vec4, Vec4Array) {
  function LineBuilder() {
    this.numVertices = 0;
    var initialLength = 8;
    Geometry.call(this, {
      position : {
        type : 'Vec3',
        length : initialLength
      },
      color : {
        type : 'Vec3',
        length : initialLength
      }
    })
  }

  LineBuilder.prototype = Object.create(Geometry);

  LineBuilder.prototype.addLine = function(a, b, colorA, colorB) {
    this.assureSize(this.numVertices + 2);
    colorA = colorA || [1, 1, 1, 1];
    colorB = colorB || colorA;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    Vec3.copy(positions[this.numVertices + 0], a);
    Vec3.copy(positions[this.numVertices + 1], b);

    Vec3.copy(colors[this.numVertices + 0], colorA);
    Vec3.copy(colors[this.numVertices + 1], colorB);

    this.numVertices += 2;
  }

  LineBuilder.prototype.addCross = function(pos, size, color) {
    this.assureSize(this.numVertices + 6);

    size = size || 0.1;
    var halfSize = size / 2;

    color = color || [1, 1, 1, 1];

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    Vec3.set(positions[this.numVertices + 0], pos[0] - halfSize, pos[1], pos[2]);
    Vec3.set(positions[this.numVertices + 1], pos[0] + halfSize, pos[1], pos[2]);
    Vec3.set(positions[this.numVertices + 2], pos[0], pos[1] - halfSize, pos[2]);
    Vec3.set(positions[this.numVertices + 3], pos[0], pos[1] + halfSize, pos[2]);
    Vec3.set(positions[this.numVertices + 4], pos[0], pos[1], pos[2] - halfSize);
    Vec3.set(positions[this.numVertices + 5], pos[0], pos[1], pos[2] + halfSize);

    Vec4.set(colors[this.numVertices + 0], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 1], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 2], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 3], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 4], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 5], color[0], color[1], color[2], color[3]);

    this.numVertices += 6;
  }

  LineBuilder.prototype.assureSize = function(neededSize) {
    var currPositions = this.attribs.position.data;
    var currColors = this.attribs.color.data;

    if (neededSize < currPositions.length - 1) {
      return;
    }
    else {
      var newSize = 2 * currPositions.length;
      var newPositions = new Vec3Array(newSize);
      newPositions.buf.set(currPositions.buf);
      this.attribs.position.data = newPositions;

      var newColors = new Vec4Array(newSize);
      newColors.buf.set(currColors.buf);
      this.attribs.color.data = newColors;

      console.log('LineBuilder.assureSize: Resizing to ' + newSize);
    }

  }

  LineBuilder.prototype.start = function() {
    this.numVertices = 0;
  }

  LineBuilder.prototype.end = function() {
    var n = this.attribs.position.data.length;

    for(var i=this.numVertices; i<n; i++) {
      Vec3.set(this.attribs.position.data[i], 0, 0, 0);
      Vec4.set(this.attribs.color.data[i], 0, 0, 0);
    }
    this.attribs.position.isDirty = true;
    this.attribs.color.isDirty = true;
    this.numVertices = 0;
  }

  return LineBuilder;
});
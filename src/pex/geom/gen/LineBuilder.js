define([
  'pex/geom/Geometry',
  'pex/geom/Vec3',
  'pex/color/Color'],
  function(Geometry, Vec3, Color) {
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
    colorA = colorA || Color.White;
    colorB = colorB || colorA;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    positions[this.numVertices + 0] = Vec3.create().copy(a);
    positions[this.numVertices + 1] = Vec3.create().copy(b);

    colors[this.numVertices + 0] = Color.create().copy(colorA);
    colors[this.numVertices + 1] = Color.create().copy(colorB);

    this.numVertices += 2;
  }

  LineBuilder.prototype.addCross = function(pos, size, color) {
    this.assureSize(this.numVertices + 6);

    size = size || 0.1;
    var halfSize = size / 2;

    color = color || Color.White;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    positions[this.numVertices + 0] = Vec3.create().set(pos.x - halfSize, pos.y, pos.z);
    positions[this.numVertices + 1] = Vec3.create().set(pos.x + halfSize, pos.y, pos.z);
    positions[this.numVertices + 2] = Vec3.create().set(pos.x, pos.y - halfSize, pos.z);
    positions[this.numVertices + 3] = Vec3.create().set(pos.x, pos.y + halfSize, pos.z);
    positions[this.numVertices + 4] = Vec3.create().set(pos.x, pos.y, pos.z - halfSize);
    positions[this.numVertices + 5] = Vec3.create().set(pos.x, pos.y, pos.z + halfSize);

    colors[this.numVertices + 0] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 1] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 2] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 3] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 4] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 5] = Color.create().set(color.r, color.g, color.b, color.a);

    this.numVertices += 6;
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
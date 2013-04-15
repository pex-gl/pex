define(['pex/geom/Vec2Array', 'pex/geom/Vec3Array', 'pex/geom/Vec4Array'], function(Vec2Array, Vec3Array, Vec4Array) {
  var elementSizeMap = {
    'Vec2' : 2,
    'Vec3' : 3,
    'Vec4' : 4
  };

  function Geometry(attribs) {
    this.faces = [];
    this.edges = [];
    this.attribs = attribs || {};

    for(var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      attrib.isDirty = true;
      attrib.elementSize = elementSizeMap[attrib.type];
      if (attrib.type == 'Vec2') { attrib.data = new Vec2Array(attrib.length); }
      if (attrib.type == 'Vec3') { attrib.data = new Vec3Array(attrib.length); }
      if (attrib.type == 'Vec4') { attrib.data = new Vec4Array(attrib.length); }
    }
  }

  Geometry.prototype.assureSize = function(numVertices) {
    for(var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      if (attrib.length < numVertices) {
        var newSize = Math.floor(numVertices * 2);
        var newAttribData;
        if (attrib.type == 'Vec2') { newAttribData = new Vec3Array(newSize); }
        if (attrib.type == 'Vec3') { newAttribData = new Vec3Array(newSize); }
        if (attrib.type == 'Vec4') { newAttribData = new Vec3Array(newSize); }
        newAttribData.buf.set(attrib.data.buf);
        attrib.length = newSize;
        attrib.data = newAttribData;
        attrib.isDirty = true;
      }
    }
  }

  return Geometry;
});
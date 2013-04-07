define([], function() {
  function FacePolygon(vertexIndexList) {
    this.numVertices = vertexIndexList.length;
    var indices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    for(var i=0; i<vertexIndexList.length; i++) {
      this[indices[i]] = vertexIndexList[i];
    }
  }

  return FacePolygon;
});
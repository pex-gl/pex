define(['pex/geom/hem/HEMesh'], function(HEMesh) {
  function HEMarking() {
  }

  function removeMark(o) { o.marked = false; }

  HEMesh.prototype.clearMarking = function() {
    this.vertices.forEach(removeMark);
    this.edges.forEach(removeMark);
    this.faces.forEach(removeMark);
    return this;
  };

  return HEMarking;
});
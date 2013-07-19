define(['pex/geom/hem/HEMesh'], function(HEMesh) {

  function HEPull() {
  }

  HEMesh.prototype.pull = function(amount, radius, variation) {
    variation = variation || 0;
    var cache = [];
    this.getSelectedVertices().forEach(function(vertex, i) {
      var a = amount - amount * (Math.random() * variation);
      var n = vertex.getNormal();
      cache[i] = n.dup().scale(a).add(vertex.position);
    })
    this.getSelectedVertices().map(function(vertex, i) {
      vertex.position.x = cache[i].x;
      vertex.position.y = cache[i].y;
      vertex.position.z = cache[i].z;
      return cache[i];
    });
    return this;
  }

  return HEPull;
});

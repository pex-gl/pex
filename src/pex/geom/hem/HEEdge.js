define([], function() {
  function HEEdge(vert, pair, face, next) {
    this.vert = vert;
    this.pair = pair;
    this.face = face;
    this.next = next;
    this.selected = 0;
  }

  HEEdge.prototype.findPrev = function() {
    var edge = this;
    while(edge.next != this) {
      edge = edge.next;
    }
    return edge;
  }
  return HEEdge;
});

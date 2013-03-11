define([], function() {

  var NUM_ELEMENTS = 2;
  var ELEMENT_BYTES = 4;

  function Vec2Array(n) {
    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec2Array.prototype = new Array();

  return Vec2Array;
});
define([], function() {

  var NUM_ELEMENTS = 4;
  var ELEMENT_BYTES = 4;

  function Vec4Array(n) {
    Array.call(this);
    this.length = n;

    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec4Array.prototype = Object.create(Array.prototype);

  return Vec4Array;
});
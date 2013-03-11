define([], function() {

  var NUM_ELEMENTS = 3;
  var ELEMENT_BYTES = 4;

  function Vec3Array(n) {
    Array.call(this, n);

    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec3Array.prototype = Object.create(Array.prototype);

  return Vec3Array;
});
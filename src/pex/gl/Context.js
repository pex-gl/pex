define([], function() {
  function Context(gl) {
    this.gl = gl;
  }

  Context.currentContext = null;

  return Context;
});
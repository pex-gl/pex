define([], function () {
  function Context(gl) {
    this.gl = gl;
  }
  Context.currentContext = new Context(null);
  return Context;
});
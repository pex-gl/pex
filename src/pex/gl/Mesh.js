define(['pex/gl/Context'], function(Context) {
  function Mesh(geometry, material) {
    this.gl = Context.currentContext.gl;
    this.geometry = geometry;
    this.material = material;
  }
});
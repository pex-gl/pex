define(["pex/core/Vec3"], function(Vec3) {
  function Ray() {   
    this.origin = new Vec3(0, 0, 0);
    this.direction = new Vec3(0, 0, 1)
  }
    
  return Ray;
});
//A ray.  
//
//Consists of the starting point *origin* and the *direction* vector.  
//Used for collision detection.
define(["pex/core/Vec3"], function(Vec3) {

  //### Ray ( )
  function Ray() {   
    this.origin = new Vec3(0, 0, 0);
    this.direction = new Vec3(0, 0, 1)
  }

  return Ray;
});
//Generates position rotating about a target.  
//Usefull for moving camera automaticaly.

//## Example Use
//     var camera = new PerspecitveCamera();
//
//     var orbiter = new Orbiter( 
//       new Vec3(0,0,0), 
//       5, 
//       camera, 
//       "setPosition"
//     ); 

//## Reference

define(["pex/core/Vec3"], function(Vec3) {
  //### Orbiter ( center, distance, bindTarget, bindProperty )
  //`center` - center of interest *{ Vec3 }*  
  //`distance` - distance from the center *{ Number }*  
  //`target` - object to which apply the new position *{ Object }*  
  //`position` - target position property name *{ String }*  
  function Orbiter(center, distance, bindTarget, bindProperty) {
    this.center = center;
    this.distance = distance;
    this.bindTarget = bindTarget;
    this.bindProperty = bindProperty;
    this.rotation = 0;
    this.speed = 1;
  }

  //### update ( delta )
  //Moves target object to next position around the orbit
  //
  //`delta` - delta time in seconds *{ Number }*  
  Orbiter.prototype.update = function(delta) {
    this.rotation += delta * this.speed;

    var p = new Vec3(Math.cos(this.rotation), 0, Math.sin(this.rotation));
    p.scale(this.distance).add(this.center);

    if (typeof(this.bindTarget[this.bindProperty]) == "function") {
      this.bindTarget[this.bindProperty].call(this.bindTarget, p);
    }
    else {
      this.bindTarget[this.bindProperty] = p;
    }
  }

  return Orbiter;
});
//Arcball camera controller based on implementation in [Embr](https://github.com/notlion/embr)

//## Example Use
//     var camera = new PerspecitveCamera();
//     var arball = new Arcball(this, camera, 5.0);

//## Reference
define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Quat"], function(Vec2, Vec3, Quat) {

  //### Arcball ( window, camera, distance)
  //`window` - window used to capture mouse events *{ [Window](Window.html)) }*
  //`camera` - controlled camera *{ [PerspectiveCamera](PerspectiveCamera.html) }*
  //`distance` - distance from the camera target *{ Number }*
  function Arcball(window, camera, distance) {
    this.distance = distance || 2;
    this.minDistance = distance/2 || 0.3;
    this.maxDistance = distance*2 || 5;
    this.camera = camera;
    this.window = window;
    this.center = new Vec2(window.width/2, window.height/2);
    this.radius = 0.9 * Math.min(window.width/2, window.height/2);
    this.orientation = Quat.identity();

    this.updateCamera();

    var self = this;

    window.on('leftMouseDown', function(e) {
      if (e.handled) return;
      self.down(e.x, e.y);
    });

    window.on('mouseDragged', function(e) {
      if (e.handled) return;
      self.drag(e.x, e.y);
    });

    window.on('scrollWheel', function(e) {
      if (e.handled) return;
      self.distance = Math.min(self.maxDistance, Math.max(self.distance + e.dy/100*(self.maxDistance-self.minDistance), self.minDistance));
      self.updateCamera();
    });
  }

  //### screenToSphere ( x, y )
  //Maps mouse position to a point on a virtual sphere.
  //Utility function used by down() and drag().
  //
  //`x` - x position of the mouse *{ Number }*
  //`y` - y position of the mouse *{ Number }*
  Arcball.prototype.screenToSphere = function(x, y){
    var pos = new Vec3(
      (x - this.center.x) / (this.radius * 2),
      (y - this.center.y) / (this.radius * 2),
      0
    );

    pos.y *= -1;

    var len2 = pos.lengthSquared();
      if(len2 > 1){
      pos.scale(1 / Math.sqrt(len2));
    }
    else {
      pos.z = Math.sqrt(1 - len2);
      pos.normalize();
    }

    return pos;
  }

  //### down ( x, y )
  //This function should be called then the mouse button is down
  //i.e. when the user is starting dragging.
  //
  //`x` - x position of the mouse *{ Number }*
  //`y` - y position of the mouse *{ Number }*
  Arcball.prototype.down = function(x, y) {
    this.down_pos = this.screenToSphere(x, y);
    this.down_ori = this.orientation.dup();
  }

  //### drag ( x, y )
  //This function should be called then the mouse is dragged.
  //
  //`x` - x position of the mouse *{ Number }*
  //`y` - y position of the mouse *{ Number }*
  Arcball.prototype.drag = function(x, y) {
    var pos  = this.screenToSphere(x, y);
    var axis = this.down_pos.dup().cross(pos);
    this.orientation = this.down_ori.mulled(new Quat(axis.x, axis.y, axis.z, this.down_pos.dot(pos)));
    this.orientation.normalize();

    this.updateCamera();
  }

  //### updateCamera ( )
  //Updates camera matrices. Called automaticaly.
  Arcball.prototype.updateCamera = function() {
    var arcballRotation = this.orientation.toMat4();

    this.camera.viewMatrix.reset();
    this.camera.viewMatrix.translate(0, 0, -this.distance);
    this.camera.viewMatrix.mul(arcballRotation);
  }

  return Arcball;
});
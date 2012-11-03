//Mouse drag camera controller simulating dragging and rotating a virutal sphere.
//
//Based on ["A User Interface for Specifying Three-Dimensional Orientation Using a Mouse"](http://www.talisman.org/~erlkonig/misc/shoemake92-arcball.pdf) by Ken Shoemake

//## Example Use
//     var camera = new PerspecitveCamera();
//     var arball = new Arcball(this, camera, 5.0);

//## Reference
define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Vec4", "pex/core/Quat", "pex/core/Mat4"], function(Vec2, Vec3, Vec4, Quat, Mat4) {
  //### Arcball (window, camera, distance)
  //
  //`window` - parent window that will handle mouse *{ Window }*  
  //`camera` - camera that we want to control *{ PerspectiveCamera }*  
  //`distance` - distance from center of the scene {0,0,0} *{ Number }*  = 2
  function Arcball(window, camera, distance) {
    this.distance = distance || 2;
    this.minDistance = distance/2 || 0.3;
    this.maxDistance = distance*2 || 5;
    this.camera = camera;
    this.window = window;
    this.radius = Math.min(window.width/2, window.height/2) * 2;
    this.center = new Vec2(window.width/2, window.height/2);
    this.currRot = Quat.fromRotationAxis(Math.PI, 0, 1, 0);
    this.clickRot = Quat.identity();
    this.dragRot = Quat.identity();
    this.clickPos = new Vec3();
    this.dragPos = new Vec3();
    this.rotAxis = new Vec3();
    this.rotateCameraNotObject = true;

    this.updateCamera();

    var self = this;
    window.on('leftMouseDown', function(e) {
      if (e.handled) return;
      self.down(e.x, self.window.height - e.y); //we flip the y coord to make rotating camera work
    });

    window.on('mouseDragged', function(e) {
      if (e.handled) return;
      self.drag(e.x, self.window.height - e.y); //we flip the y coord to make rotating camera work
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
  Arcball.prototype.mouseToSphere = function(x, y) {
    var v = new Vec3(0, 0, 0);
    v.x = (x - this.center.x) / this.radius;
    v.y = -(y - this.center.y) / this.radius;
    v.z = 0;

    var dist = (v.x * v.x) + (v.y * v.y);
    if (dist > 1) {
      v.normalize();
    }
    else {
      v.z = Math.sqrt( 1.0 - dist );
    }
    return v;
  }

  //### down ( x, y )
  //This function should be called then the mouse button is down
  //i.e. when the user is starting dragging.
  //
  //`x` - x position of the mouse *{ Number }*  
  //`y` - y position of the mouse *{ Number }*
  Arcball.prototype.down = function(x, y) {
    this.clickPos = this.mouseToSphere(x, y);
    this.clickRot.setQuat( this.currRot );
    this.updateCamera();
  }

  //### drag ( x, y )
  //This function should be called then the mouse is dragged.
  //
  //`x` - x position of the mouse *{ Number }*  
  //`y` - y position of the mouse *{ Number }*
  Arcball.prototype.drag = function(x, y) {
    this.dragPos = this.mouseToSphere(x, y);
    this.rotAxis.cross2(this.clickPos, this.dragPos);
    var theta = this.clickPos.dot(this.dragPos);
    this.dragRot.set(this.rotAxis.x, this.rotAxis.y, this.rotAxis.z, theta);
    this.currRot.mul2(this.dragRot, this.clickRot);
    this.updateCamera();
  }

  //### updateCamera ( )
  //Updates camera matrices. Called automaticaly.
  Arcball.prototype.updateCamera = function() {
    //Based on [apply-and-arcball-rotation-to-a-camera](http://forum.libcinder.org/topic/apply-and-arcball-rotation-to-a-camera) on Cinder Forum.
    if (this.rotateCameraNotObject) {
      var q = this.currRot.dup();
      q.w *= -1;

      var target = new Vec3(0, 0, 0);
      var offset = q.mulVec3(new Vec3(0, 0, this.distance));
      var eye = target.subbed(offset);
      var up = q.mulVec3(new Vec3(0, 1, 0));
      this.camera.lookAt(target, eye, up);
    }
    else {
      var arcballRotation = this.currRot.toMat4();
      var rotationMatrix = new Mat4();
      rotationMatrix.reset();
      rotationMatrix.translate(this.tran, 0, -this.distance);
      rotationMatrix.mul(arcballRotation);
      this.camera.viewMatrix.reset();
      this.camera.viewMatrix.translate(0, 0, -this.distance);
      this.camera.viewMatrix.mul(arcballRotation);
    }
  }

  return Arcball;
});

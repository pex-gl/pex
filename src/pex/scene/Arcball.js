define(['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec4', 'pex/geom/Quat', 'pex/geom/Mat4'], 
  function(Vec2, Vec3, Vec4, Quat, Mat4) {
  function Arcball(window, camera, distance) {
    this.distance = distance || 2;
    this.minDistance = distance/2 || 0.3;
    this.maxDistance = distance*2 || 5;
    this.camera = camera;
    this.window = window;
    this.radius = Math.min(window.width/2, window.height/2) * 2;
    this.center = Vec2.fromValues(window.width/2, window.height/2);
    this.currRot = Quat.create();
    Quat.setAxisAngle(this.currRot, Vec3.fromValues(0, 1, 0), Math.PI);
    this.clickRot = Quat.create();
    this.dragRot = Quat.create();
    this.clickPos = Vec3.create();
    this.dragPos = Vec3.create();
    this.rotAxis = Vec3.create();
    this.allowZooming = true;

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
      if (!self.allowZooming) return;
      self.distance = Math.min(self.maxDistance, Math.max(self.distance + e.dy/100*(self.maxDistance-self.minDistance), self.minDistance));
      self.updateCamera();
    });
  }

  Arcball.prototype.mouseToSphere = function(x, y) {
    var v = Vec3.fromValues((x - this.center[0]) / this.radius, -(y - this.center[1]) / this.radius, 0);

    var dist = (v[0] * v[0]) + (v[1] * v[1]);
    if (dist > 1) {
      Vec3.normalize(v, v);
    }
    else {
      v[2] = Math.sqrt( 1.0 - dist );
    }
    return v;
  }

  Arcball.prototype.down = function(x, y) {
    this.clickPos = this.mouseToSphere(x, y);
    Quat.copy(this.clickRot, this.currRot);
    this.updateCamera();
  }

  Arcball.prototype.drag = function(x, y) {
    this.dragPos = this.mouseToSphere(x, y);
    Vec3.cross(this.rotAxis, this.clickPos, this.dragPos);
    var theta = Vec3.dot(this.clickPos, this.dragPos);
    Quat.set(this.dragRot, this.rotAxis[0], this.rotAxis[1], this.rotAxis[2], theta);
    Quat.mul(this.currRot, this.dragRot, this.clickRot);
    this.updateCamera();
  }

  Arcball.prototype.updateCamera = function() {
    //Based on [apply-and-arcball-rotation-to-a-camera](http://forum.libcinder.org/topic/apply-and-arcball-rotation-to-a-camera) on Cinder Forum.
    var q = Quat.clone(this.currRot);
    q[3] *= -1;

    var target = Vec3.fromValues(0, 0, 0);
    var offset = Vec3.create();
    Vec3.transformQuat(offset, Vec3.fromValues(0, 0, this.distance), q)
    var eye = Vec3.create();
    Vec3.sub(eye, target, offset);
    var up = Vec3.create();
    Vec3.transformQuat(up, Vec3.fromValues(0, 1, 0), q);
    this.camera.lookAt(target, eye, up);
  }

  Arcball.prototype.disableZoom = function() {
    this.allowZooming = false;
  }

  return Arcball;
});
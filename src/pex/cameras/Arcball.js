//a shameless copy&paste from Embr by Ryan Alexander
define(["pex/core/Core"], function(Core) {
  var Vec3 = Core.Vec3;
  var Quat = Core.Quat;

  function Arcball(window, camera, center, radius, distance) {
    this.distance = distance || 2;
    this.minDistance = 0.3;
    this.maxDistance = 5;
    this.camera = camera;
    this.window = window;
    this.center = center;
    this.radius = radius;
    this.orientation = Quat.identity();

    this.updateCamera();

    var self = this;

    window.on('leftMouseDown', function(e) {
      self.down(e.x, e.y);
    });

    window.on('mouseDragged', function(e) {
      self.drag(e.x, e.y);
    });

    window.on('scrollWheel', function(e) {
      self.distance = Math.min(self.maxDistance, Math.max(self.distance + e.dy/100, self.minDistance));
      self.updateCamera();
    });
  }

  Arcball.prototype = {
    screenToSphere: function(x, y){
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
    },

    down: function(x, y){
      this.down_pos = this.screenToSphere(x, y);
      this.down_ori = this.orientation.dup();
    },

    drag: function(x, y){
      var pos  = this.screenToSphere(x, y);
      var axis = this.down_pos.dup().cross(pos);
      this.orientation = this.down_ori.mulled(new Quat(axis.x, axis.y, axis.z, this.down_pos.dot(pos)));
      this.orientation.normalize();

      this.updateCamera();
    },

    updateCamera: function() {
      var arcballRotation = this.orientation.toMat4();

      this.camera.viewMatrix.reset();
      this.camera.viewMatrix.translate(0, 0, -this.distance);
      this.camera.viewMatrix.mul(arcballRotation);
    }


  };
  return Arcball;
});
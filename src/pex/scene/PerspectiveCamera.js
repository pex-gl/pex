(function() {
  define(function(require) {
    var Mat4, PerspectiveCamera, Ray, Vec2, Vec3, Vec4, _ref;
    _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Mat4 = _ref.Mat4, Ray = _ref.Ray;
    return PerspectiveCamera = (function() {
      var projected;

      function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {
        this.fov = fov || 60;
        this.aspectRatio = aspectRatio || 4 / 3;
        this.near = near || 0.1;
        this.far = far || 100;
        this.position = position || Vec3.create(0, 0, 5);
        this.target = target || Vec3.create(0, 0, 0);
        this.up = up || Vec3.create(0, 1, 0);
        this.projectionMatrix = Mat4.create();
        this.viewMatrix = Mat4.create();
        this.updateMatrices();
      }

      PerspectiveCamera.prototype.getFov = function() {
        return this.fov;
      };

      PerspectiveCamera.prototype.getAspectRatio = function() {
        return this.aspectRatio;
      };

      PerspectiveCamera.prototype.getNear = function() {
        return this.near;
      };

      PerspectiveCamera.prototype.getFar = function() {
        return this.far;
      };

      PerspectiveCamera.prototype.getPosition = function() {
        return this.position;
      };

      PerspectiveCamera.prototype.getTarget = function() {
        return this.target;
      };

      PerspectiveCamera.prototype.getUp = function() {
        return this.up;
      };

      PerspectiveCamera.prototype.getViewMatrix = function() {
        return this.viewMatrix;
      };

      PerspectiveCamera.prototype.getProjectionMatrix = function() {
        return this.projectionMatrix;
      };

      PerspectiveCamera.prototype.setFov = function(fov) {
        this.fov = fov;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setAspectRatio = function(ratio) {
        this.aspectRatio = ratio;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setFar = function(far) {
        this.far = far;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setNear = function(near) {
        this.near = near;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setPosition = function(position) {
        this.position = position;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setTarget = function(target) {
        this.target = target;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.setUp = function(up) {
        this.up = up;
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.lookAt = function(target, eyePosition, up) {
        if (target) {
          this.target = target;
        }
        if (eyePosition) {
          this.position = eyePosition;
        }
        if (up) {
          this.up = up;
        }
        return this.updateMatrices();
      };

      PerspectiveCamera.prototype.updateMatrices = function() {
        this.projectionMatrix.identity().perspective(this.fov, this.aspectRatio, this.near, this.far);
        return this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
      };

      projected = Vec4.create();

      PerspectiveCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
        var out;
        projected.set(point.x, point.y, point.z, 1.0);
        projected.transformMat4(this.viewMatrix);
        projected.transformMat4(this.projectionMatrix);
        out = Vec2.create().set(projected.x, projected.y);
        out.x /= projected.w;
        out.y /= projected.w;
        out.x = out.x * 0.5 + 0.5;
        out.y = out.y * 0.5 + 0.5;
        out.x *= windowWidth;
        out.y *= windowHeight;
        return out;
      };

      PerspectiveCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
        var hNear, invViewMatrix, vOrigin, vTarget, wDirection, wNear, wOrigin, wTarget;
        x = (x - windowWidth / 2) / (windowWidth / 2);
        y = -(y - windowHeight / 2) / (windowHeight / 2);
        hNear = 2 * Math.tan(this.getFov() / 180 * Math.PI / 2) * this.getNear();
        wNear = hNear * this.getAspectRatio();
        x *= wNear / 2;
        y *= hNear / 2;
        vOrigin = new Vec3(0, 0, 0);
        vTarget = new Vec3(x, y, -this.getNear());
        invViewMatrix = this.getViewMatrix().dup().invert();
        wOrigin = vOrigin.dup().transformMat4(invViewMatrix);
        wTarget = vTarget.dup().transformMat4(invViewMatrix);
        wDirection = wTarget.dup().sub(wOrigin);
        return new Ray(wOrigin, wDirection);
      };

      return PerspectiveCamera;

    })();
  });

}).call(this);

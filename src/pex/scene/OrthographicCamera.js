(function() {
  define(function(require) {
    var Mat4, OrthographicCamera, Ray, Vec2, Vec3, Vec4, _ref;
    _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Mat4 = _ref.Mat4, Ray = _ref.Ray;
    return OrthographicCamera = (function() {
      var projected;

      function OrthographicCamera(l, r, b, t, near, far, position, target, up) {
        this.left = l;
        this.right = r;
        this.bottom = b;
        this.top = t;
        this.near = near || 0.1;
        this.far = far || 100;
        this.position = position || Vec3.create(0, 0, 5);
        this.target = target || Vec3.create(0, 0, 0);
        this.up = up || Vec3.create(0, 1, 0);
        this.projectionMatrix = Mat4.create();
        this.viewMatrix = Mat4.create();
        this.updateMatrices();
      }

      OrthographicCamera.prototype.getFov = function() {
        return this.fov;
      };

      OrthographicCamera.prototype.getAspectRatio = function() {
        return this.aspectRatio;
      };

      OrthographicCamera.prototype.getNear = function() {
        return this.near;
      };

      OrthographicCamera.prototype.getFar = function() {
        return this.far;
      };

      OrthographicCamera.prototype.getPosition = function() {
        return this.position;
      };

      OrthographicCamera.prototype.getTarget = function() {
        return this.target;
      };

      OrthographicCamera.prototype.getUp = function() {
        return this.up;
      };

      OrthographicCamera.prototype.getViewMatrix = function() {
        return this.viewMatrix;
      };

      OrthographicCamera.prototype.getProjectionMatrix = function() {
        return this.projectionMatrix;
      };

      OrthographicCamera.prototype.setFov = function(fov) {
        this.fov = fov;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setAspectRatio = function(ratio) {
        this.aspectRatio = ratio;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setFar = function(far) {
        this.far = far;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setNear = function(near) {
        this.near = near;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setPosition = function(position) {
        this.position = position;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setTarget = function(target) {
        this.target = target;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.setUp = function(up) {
        this.up = up;
        return this.updateMatrices();
      };

      OrthographicCamera.prototype.lookAt = function(target, eyePosition, up) {
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

      OrthographicCamera.prototype.updateMatrices = function() {
        this.projectionMatrix.identity().ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
        return this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
      };

      projected = Vec4.create();

      OrthographicCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
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

      OrthographicCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
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

      return OrthographicCamera;

    })();
  });

}).call(this);

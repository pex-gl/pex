(function() {
  define(function(require) {
    var Arcball, Mat4, Quat, Vec2, Vec3, Vec4, _ref;
    _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Quat = _ref.Quat, Mat4 = _ref.Mat4;
    return Arcball = (function() {
      function Arcball(window, camera, distance) {
        this.distance = distance || 2;
        this.minDistance = distance / 2 || 0.3;
        this.maxDistance = distance * 2 || 5;
        this.camera = camera;
        this.window = window;
        this.radius = Math.min(window.width / 2, window.height / 2) * 2;
        this.center = Vec2.create(window.width / 2, window.height / 2);
        this.currRot = Quat.create();
        this.currRot.setAxisAngle(Vec3.create(0, 1, 0), 180);
        this.clickRot = Quat.create();
        this.dragRot = Quat.create();
        this.clickPos = Vec3.create();
        this.dragPos = Vec3.create();
        this.rotAxis = Vec3.create();
        this.allowZooming = true;
        this.enabled = true;
        this.updateCamera();
        this.addEventHanlders();
      }

      Arcball.prototype.addEventHanlders = function() {
        this.window.on('leftMouseDown', (function(_this) {
          return function(e) {
            if (e.handled || !_this.enabled) {
              return;
            }
            return _this.down(e.x, _this.window.height - e.y);
          };
        })(this));
        this.window.on('mouseDragged', (function(_this) {
          return function(e) {
            if (e.handled || !_this.enabled) {
              return;
            }
            return _this.drag(e.x, _this.window.height - e.y);
          };
        })(this));
        return this.window.on('scrollWheel', (function(_this) {
          return function(e) {
            if (e.handled || !_this.enabled) {
              return;
            }
            if (!_this.allowZooming) {
              return;
            }
            _this.distance = Math.min(_this.maxDistance, Math.max(_this.distance + e.dy / 100 * (_this.maxDistance - _this.minDistance), _this.minDistance));
            return _this.updateCamera();
          };
        })(this));
      };

      Arcball.prototype.mouseToSphere = function(x, y) {
        var dist, v;
        v = Vec3.create((x - this.center.x) / this.radius, -(y - this.center.y) / this.radius, 0);
        dist = v.x * v.x + v.y * v.y;
        if (dist > 1) {
          v.normalize();
        } else {
          v.z = Math.sqrt(1.0 - dist);
        }
        return v;
      };

      Arcball.prototype.down = function(x, y) {
        this.clickPos = this.mouseToSphere(x, y);
        this.clickRot.copy(this.currRot);
        return this.updateCamera();
      };

      Arcball.prototype.drag = function(x, y) {
        var theta;
        this.dragPos = this.mouseToSphere(x, y);
        this.rotAxis.asCross(this.clickPos, this.dragPos);
        theta = this.clickPos.dot(this.dragPos);
        this.dragRot.set(this.rotAxis.x, this.rotAxis.y, this.rotAxis.z, theta);
        this.currRot.asMul(this.dragRot, this.clickRot);
        return this.updateCamera();
      };

      Arcball.prototype.updateCamera = function() {
        var eye, offset, q, target, up;
        q = this.currRot.clone();
        q.w *= -1;
        target = this.target || Vec3.create(0, 0, 0);
        offset = Vec3.create(0, 0, this.distance).transformQuat(q);
        eye = Vec3.create().asSub(target, offset);
        up = Vec3.create(0, 1, 0).transformQuat(q);
        return this.camera.lookAt(target, eye, up);
      };

      Arcball.prototype.disableZoom = function() {
        return this.allowZooming = false;
      };

      Arcball.prototype.setDistance = function(distance) {
        this.distance = distance || 2;
        this.minDistance = distance / 2 || 0.3;
        this.maxDistance = distance * 2 || 5;
        return this.updateCamera();
      };

      return Arcball;

    })();
  });

}).call(this);

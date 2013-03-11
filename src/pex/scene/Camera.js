define(['pex/geom'], function(geom) {
  var Vec2 = geom.Vec2;
  var Vec3 = geom.Vec4;
  var Mat4 = geom.Mat4;

  function Camera(fov, aspectRatio, near, far, position, target, up) {

    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4/3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || Vec3.fromValues(0, 0, 5);

    this.target = target || Vec3.fromValues(0, 0, 0);
    this.up = up || Vec3.fromValues(0, 1, 0);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.updateMatrices();
  }

  Camera.prototype.setPosition = function(position) {
    this.position = position;
    this.updateMatrices();
  }

  Camera.prototype.getPosition = function() {
    return this.position;
  }

  Camera.prototype.setTarget = function(target) {
    this.target = target;
    this.updateMatrices();
  }

  Camera.prototype.getTarget = function() {
    return this.target;
  }

  Camera.prototype.setUp = function(up) {
    this.up = up;
    this.updateMatrices();
  }

  Camera.prototype.getUp = function() {
    return this.up;
  }

  Camera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) this.target = target;
    if (eyePosition) this.position = eyePosition;
    if (up) this.up = up;
    this.updateMatrices();
  }


  Camera.prototype.setNear = function(near) {
    this.near = near;
    this.updateMatrices();
  }

  Camera.prototype.getNear = function() {
    return this.near;
  }

  Camera.prototype.setFar = function(far) {
    this.far = far;
    this.updateMatrices();
  }

  Camera.prototype.getFar = function() {
    return this.far;
  }

  Camera.prototype.setFov = function(fov) {
    this.fov = fov;
    this.updateMatrices();
  }

  Camera.prototype.getFov = function() {
    return this.fov;
  }

  Camera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    this.updateMatrices();
  }

  Camera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  }

  Camera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  Camera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  Camera.prototype.updateMatrices = function() {
    Mat4.perspective(this.projectionMatrix, this.fov / 180 * Math.PI, this.aspectRatio, this.near, this.far);
    Mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  return Camera;
});
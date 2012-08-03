//Makes your things look more 3d.

//## Example use
//     var camera = new PerspectiveCamera(60, this.width/this.height);
//     camera.setPosition(new Vec3(0, 0, 3));
//     camera.setTarget(new Vec3(0, 0, 0));
//
//     mesh.draw(camera);

//## Reference
define(["pex/core/Vec3", "pex/core/Vec4", "pex/core/Mat4", "pex/core/Ray"], function(Vec3, Vec4, Mat4, Ray) {

  //### PerspectiveCamera ( fov, aspectRatio, near, far, position, target, up )
  //`fov` - field of view *{ Number }* = 60
  //`aspectRatio` - window/viewport aspect ratio *{ Number }* = 4/3
  //`near` - near clipping plane *{ Number }* = 0.1
  //`far` - far clipping plane *{ Number }* = 100
  //`position` - camera position *{ Vec3 }* = (0, 0, 5)
  //`target` - the point camera is looking at *{ Vec3 }* = (0, 0, 0)
  //`up` - up vector - camera orientation *{ Vec3 }* = (0, 1, 0)
  function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {

    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4/3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || new Vec3(0, 0, 5);

    this.target = target || new Vec3(0, 0, 0);
    this.up = up || new Vec3(0, 1, 0);
    this.projectionMatrix = new Mat4();
    this.viewMatrix = new Mat4();
    this.updateMatrices();
  }

  //### setPosition ( position )
  //`position` - camera position *{ Vec3 }*
  PerspectiveCamera.prototype.setPosition = function(position) {
    this.position = position;
    this.updateMatrices();
  }

  //### getPosition (  )
  //Returns the camera position *{ Vec3 }*
  PerspectiveCamera.prototype.getPosition = function() {
    return this.position;
  }

  //### setTarget ( target )
  //`target` - the point camera is looking at *{ Vec3 }*
  PerspectiveCamera.prototype.setTarget = function(target) {
    this.target = target;
    this.updateMatrices();
  }

  //### getTarget ( )
  //Returns the point camera is looking at *{ Vec3 }*
  PerspectiveCamera.prototype.getTarget = function() {
    return this.target;
  }

  //### setUp ( target )
  //`up` - up vector - camera orientation *{ Vec3 }*
  PerspectiveCamera.prototype.setUp = function(up) {
    this.up = up;
    this.updateMatrices();
  }

  //### getUp ( )
  //Returns the up vector - camera orientation *{ Vec3 }*
  PerspectiveCamera.prototype.getUp = function() {
    return this.up;
  }

  PerspectiveCamera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) this.target = target;
    if (eyePosition) this.position = eyePosition;
    if (up) this.up = up;
    this.updateMatrices();
  }


  //### setNear ( near )
  //`near` - near clipping plane *{ Number }*
  PerspectiveCamera.prototype.setNear = function(near) {
    this.near = near;
    this.updateMatrices();
  }

  //### getNear ( )
  //Returns near clipping plane *{ Number }*
  PerspectiveCamera.prototype.getNear = function() {
    return this.near;
  }

  //### setFar ( far )
  //`far` - far clipping plane *{ Number }*
  PerspectiveCamera.prototype.setFar = function(far) {
    this.far = far;
    this.updateMatrices();
  }

  //### getFar ( far )
  //returns the far clipping plane *{ Number }*
  PerspectiveCamera.prototype.getFar = function() {
    return this.far;
  }

  //### setFov ( fov )
  //`fov` - field of view *{ Number }*
  PerspectiveCamera.prototype.setFov = function(fov) {
    this.fov = fov;
    this.updateMatrices();
  }

  //### getFov ( )
  //Returns the field of view *{ Number }*
  PerspectiveCamera.prototype.getFov = function() {
    return this.fov;
  }

  //### setAspectRatio ( ratio )
  //`ratio` - window/viewport aspect ratio *{ Number }*
  PerspectiveCamera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    this.updateMatrices();
  }

  //### getAspectRatio ( )
  //Returns the camera aspect ratio *{ Number }*
  PerspectiveCamera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  }

  //### getViewMatrix ( )
  //Returns camera view matrix *{ Mat4 }*
  PerspectiveCamera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  //### getProjectionMatrix ( )
  //Returns camera projection matrix *{ Mat4 }*
  PerspectiveCamera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  //### updateMatrices ( )
  //Updates camera projection and view matrices.
  //Called automaticaly when camera parameters change.
  PerspectiveCamera.prototype.updateMatrices = function() {
    this.projectionMatrix.reset();
    this.projectionMatrix.perspective(this.fov, this.aspectRatio, this.near, this.far);
    this.viewMatrix.reset();
    this.viewMatrix.lookAt(
      this.position.x, this.position.y, this.position.z,
      this.target.x, this.target.y, this.target.z,
      this.up.x, this.up.y, this.up.z
    );
  }

  //### calcModelViewMatrix ( modelTranslation, modelRotation, modelScale )
  //Utility function for calculating model view matrix
  //
  //`modelTranslation` - model position *{ Vec3 }* = {0, 0, 0}
  //`modelRotation` - model rotation (x, y, z, angle) *{ Vec4 }* = {0, 1, 0, 0}
  //`modelScale` - model scale *{ Vec3 }* = {1, 1, 1}
  PerspectiveCamera.prototype.calcModelViewMatrix = function(modelTranslation, modelRotation, modelScale) {
    var t = modelTranslation ? modelTranslation : new Vec3(0, 0, 0);
    var r = modelRotation ? modelRotation : new Vec4(0, 1, 0, 0);
    var s = modelScale ? modelScale : new Vec3(1, 1, 1);

    var modelWorldMatrix = new Mat4();
    modelWorldMatrix.scale(s.x, s.y, s.z);
    modelWorldMatrix.rotate(r.w, r.x, r.y, r.z);
    modelWorldMatrix.translate(t.x, t.y, t.z);

    var modelViewMatrix = this.viewMatrix.dup();

    modelViewMatrix.mul(modelWorldMatrix);
    return modelViewMatrix;
  }

  //Gets ray in world coordinates for a x,y screen position
  //
  //`x` - x position *{ Number }*
  //`y` - y position *{ Number }*
  //`windowWidth` - width of the window *{ Number }*
  //`windowHeight` - height of the window *{ Number }*
  PerspectiveCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
    var x = (x - windowWidth/2) / (windowWidth/2);
    var y = -(y - windowHeight/2) / (windowHeight/2);

    var hNear = 2 * Math.tan(this.getFov()/180*Math.PI / 2) * this.getNear();
    var wNear = hNear * this.getAspectRatio();

    x *= wNear / 2;
    y *= hNear / 2;

    var vOrigin = new Vec3(0, 0, 0);
    var vTarget = new Vec3(x, y, -this.getNear());
    var invViewMatrix = this.getViewMatrix().dup().invert();

    var wOrigin = invViewMatrix.mulVec3(vOrigin);
    var wTarget = invViewMatrix.mulVec3(vTarget);
    var wDirection = wTarget.subbed(wOrigin);

    return new Ray(wOrigin, wDirection);
  }

  return PerspectiveCamera;
});

/*
returns array of near and far frustrum corners in view coordinates
starting from near top left and going forward in clock wise order
Pex.PerspectiveCamera.prototype.getFrustumCorners = function() {
  var hnear = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.near;
  var wnear = hnear * this.aspectRatio;
  var hfar = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.far;
  var wfar = hfar * this.aspectRatio;

  var corners = [];
  corners.push(new PreGL.Vec3(-wnear/2, hnear/2, -this.near)); //0, Near Top Left
  corners.push(new PreGL.Vec3( wnear/2, hnear/2, -this.near)); //1, Near Top Right
  corners.push(new PreGL.Vec3( wnear/2,-hnear/2, -this.near)); //2, Near Bottom Right
  corners.push(new PreGL.Vec3(-wnear/2,-hnear/2, -this.near)); //3, Near Bottom Left
  corners.push(new PreGL.Vec3(-wfar/2, hfar/2, -this.far));    //4, Far Top Left
  corners.push(new PreGL.Vec3( wfar/2, hfar/2, -this.far));    //5, Far Top Right
  corners.push(new PreGL.Vec3( wfar/2,-hfar/2, -this.far));    //6, Far Bottom Right
  corners.push(new PreGL.Vec3(-wfar/2,-hfar/2, -this.far));    //7, Far Bottom Left

  return corners;
}

Pex.PerspectiveCamera.prototype.getScreenPos = function(point, screenWidth, screenHeight) {
  point = new PreGL.Vec4(point.x, point.y, point.z, 1.0);

  var projected = this.projectionMatrix.multVec4(this.viewMatrix.multVec4(point));
  var result = new PreGL.Vec3(projected.x, projected.y, projected.z);
  result.x /= result.z;
  result.y /= -result.z;
  result.x = (result.x * 0.38) + 0.5;
  result.y = (result.y * 0.38) + 0.5;
  result.x *= screenWidth;
  result.y *= screenHeight;
  return result;
}
*/
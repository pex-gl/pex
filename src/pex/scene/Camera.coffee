define (require) ->
  { Vec3, Mat4 } = require('pex/geom')

  class Camera
    constructor: (fov, aspectRatio, near, far, position, target, up) ->
      @fov = fov || 60
      @aspectRatio = aspectRatio || 4/3
      @near = near || 0.1
      @far = far || 100
      @position = position || Vec3.create(0, 0, 5)
      @target = target || Vec3.create(0, 0, 0)
      @up = up || Vec3.create(0, 1, 0)
      @projectionMatrix = Mat4.create()
      @viewMatrix = Mat4.create()
      @updateMatrices()

    updateMatrices: () ->
      @projectionMatrix.identity().perspective(@fov, @aspectRatio, @near, @far)
      @viewMatrix.identity().lookAt(@position, @target, @up)

    getViewMatrix: () -> @viewMatrix;

    getProjectionMatrix: () -> @projectionMatrix;

    lookAt: (target, eyePosition, up) ->
      @target = target if target
      @position = eyePosition if eyePosition
      @up = up if up
      @updateMatrices()
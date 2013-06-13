define (require) ->
  { Vec2, Vec3, Vec4, Quat, Mat4 } = require('pex/geom')

  class Arcball
    constructor: (window, camera, distance) ->
      @distance = distance || 2;
      @minDistance = distance/2 || 0.3;
      @maxDistance = distance*2 || 5;
      @camera = camera;
      @window = window;
      @radius = Math.min(window.width/2, window.height/2) * 2
      @center = Vec2.create(window.width/2, window.height/2)
      @currRot = Quat.create()
      @currRot.setAxisAngle(Vec3.create(0, 1, 0), 180)
      @clickRot = Quat.create()
      @dragRot = Quat.create()
      @clickPos = Vec3.create()
      @dragPos = Vec3.create()
      @rotAxis = Vec3.create()
      @allowZooming = true
      @enabled = true

      @updateCamera()

      @addEventHanlders()

    addEventHanlders: () ->
      @window.on 'leftMouseDown', (e) =>
        return if e.handled || !@enabled
        @down(e.x, @window.height - e.y) #we flip the y coord to make rotating camera work

      @window.on 'mouseDragged', (e) =>
        return if e.handled || !@enabled
        @drag(e.x, @window.height - e.y) #we flip the y coord to make rotating camera work

      @window.on 'scrollWheel', (e) =>
        return if e.handled || !@enabled
        return if !@allowZooming
        @distance = Math.min(@maxDistance, Math.max(@distance + e.dy/100*(@maxDistance-@minDistance), @minDistance))
        @updateCamera()

    mouseToSphere: (x, y) ->
      v = Vec3.create((x - @center.x) / @radius, -(y - @center.y) / @radius, 0)

      dist = v.x * v.x + v.y * v.y
      if dist > 1
        v.normalize()
      else
        v.z = Math.sqrt( 1.0 - dist )
      v

    down: (x, y) ->
      @clickPos = @mouseToSphere(x, y)
      @clickRot.copy(@currRot)
      @updateCamera()

    drag: (x, y) ->
      @dragPos = @mouseToSphere(x, y)
      @rotAxis.asCross(@clickPos, @dragPos)
      theta = @clickPos.dot(@dragPos)
      @dragRot.set(@rotAxis.x, @rotAxis.y, @rotAxis.z, theta)
      @currRot.asMul(@dragRot, @clickRot)
      @updateCamera()

    updateCamera: () ->
      #Based on [apply-and-arcball-rotation-to-a-camera](http://forum.libcinder.org/topic/apply-and-arcball-rotation-to-a-camera) on Cinder Forum.
      q = @currRot.clone()
      q.w *= -1;

      target = Vec3.create(0, 0, 0);
      offset = Vec3.create(0, 0, @distance).transformQuat(q)
      eye = Vec3.create().asSub(target, offset)
      up = Vec3.create(0, 1, 0).transformQuat(q)
      @camera.lookAt(target, eye, up)

    disableZoom: () ->
      @allowZooming = false
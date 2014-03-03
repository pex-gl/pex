pex = pex || require('../../build/pex')

{ Scene, PerspectiveCamera, Arcball } = pex.scene
{ Mesh, Viewport } = pex.gl
{ SolidColor, Diffuse } = pex.materials
{ Color } = pex.color
{ Rect, Ray, BoundingBox, Vec3 } = pex.geom
{ Cube } = pex.geom.gen

pex.sys.Window.create
  settings:
    width: 1280
    height: 720
    fullscreen: pex.sys.Platform.isBrowser
  init: () ->
    @camera = new PerspectiveCamera(60, @width/@height)
    @arcball = new Arcball(this, @camera)
    @scene = new Scene()

    geom = new Cube(1,1,1)
    geom.computeEdges()
    @mesh = new Mesh(geom, new SolidColor({color: Color.White}), { useEdges: true })

    @pointer = new Mesh(new Cube(0.1, 0.1, 0.1), new SolidColor({color: Color.Red}), { useEdges: false })

    @bbox = BoundingBox.fromPositionSize(new Vec3(0,0,0), new Vec3(1,1,1))

    @on 'mouseMoved', (e) =>
      ray = @camera.getWorldRay(e.x, e.y, @width, @height)

      hits = ray.hitTestBoundingBox(@bbox)
      if hits.length > 0
        console.log(hits[0])
        @pointer.position = hits[0]
        null

    null

  draw: () ->
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @gl.enable(@gl.DEPTH_TEST)

    @mesh.draw(@camera)
    @pointer.draw(@camera)

    null

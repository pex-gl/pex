pex = pex || require('../../build/pex')

{ Scene, PerspectiveCamera, Arcball } = pex.scene
{ Mesh } = pex.gl
{ ShowNormals } = pex.materials
{ Color } = pex.color
{ Cube, Sphere } = pex.geom.gen
{ Vec3, Quat, Geometry, GeometryOperations } = pex.geom

pex.sys.Window.create
  settings:
    width: 1280
    height: 720
    fullscreen: pex.sys.Platform.isBrowser
  init: () ->
    @camera = new PerspectiveCamera(60, @width/@height)
    @arcball = new Arcball(this, @camera)

    geom1 = new Cube()
    geom1.translate(new Vec3(-0.45, 0, 0))
    geom1.rotate(new Quat().setAxisAngle(new Vec3(1,0,0), 45))
    geom2 = new Sphere()
    geom2.translate(new Vec3( 0.45, 0, 0))
    geom2.scale(1.5)
    geom = Geometry.merge(geom1, geom2)
    @mesh = new Mesh(geom, new ShowNormals({color: Color.White}))

  draw: () ->
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @gl.enable(@gl.DEPTH_TEST)

    @mesh.draw(@camera)

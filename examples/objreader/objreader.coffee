pex = pex || require('../../build/pex')

{ hem, Vec3, Vec4 } = pex.geom
{ Color } = pex.color
{ Camera, Arcball } = pex.scene
{ ShowNormals, Diffuse, SolidColor, ShowColors, ShowDepth } = pex.materials
{ Time, ObjReader, ObjWriter, } = pex.utils
{ Cube, Sphere } = pex.geom.gen
{ Mesh } = pex.gl
{ random } = Math

pex.sys.Window.create
  settings:
    width: 1280
    height: 720
    type: '3d'
    fullscreen: pex.sys.Platform.isBrowser

  init: () ->
    @gl.clearColor(0, 0, 0, 1)
    @gl.enable(@gl.DEPTH_TEST)

    @camera = new Camera(60, this.width/this.height)
    @arcball = new Arcball(this, this.camera, 3)
    @material = new ShowColors()

    @framerate(30)

    ObjReader.load 'mesh.obj', (geom) =>
      geom.addAttrib('colors', 'color')
      for i in [0..geom.vertices.length-1] by 3
        v = geom.vertices[i]
        c = new Color( random(), random(), random(), 1)
        geom.colors.push(c)
        geom.colors.push(c)
        geom.colors.push(c)
      @mesh = new Mesh(geom, @material)

  draw: () ->
    @gl.clearColor(0, 0, 0, 1)
    @gl.depthFunc(@gl.LEQUAL)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

    @mesh.draw(@camera) if @mesh
pex = pex || require('../../build/pex')

{ hem, Vec3, Vec4 } = pex.geom
{ Color } = pex.color
{ Camera, Arcball } = pex.scene
{ ShowNormals, Diffuse } = pex.materials
{ Time, ObjReader, ObjWriter, } = pex.utils
{ Cube, Sphere } = pex.geom.gen
{ Mesh } = pex.gl

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
    @material = new ShowNormals()
    @selectionMaterial = new Diffuse({ ambientColor : Color.create(0.2, 0, 0, 1), diffuseColor : Color.create(1, 0, 0, 1) })

    @framerate(30)

    @hem = hem().fromGeometry(new Cube(1, 1, 1)).extrude(0.5).subdivide().extrude(0.1)
    @geom = @hem.toFlatGeometry()
    @mesh = new Mesh(@geom, @material)

    ObjWriter.save(@geom, 'test.obj')

  draw: () ->
    @gl.clearColor(0, 0, 0, 1)
    @gl.depthFunc(@gl.LEQUAL)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

    @mesh.draw(@camera) if @mesh
    @selectionMesh.draw(@camera) if @selectionMesh
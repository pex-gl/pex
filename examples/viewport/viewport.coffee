pex = pex || require('../../build/pex')

{ Vec3, Rect } = pex.geom
{ Cube, Sphere } = pex.geom.gen
{ Mesh, Viewport } = pex.gl
{ Test, SolidColor } = pex.materials
{ PerspectiveCamera, Arcball, Scene } = pex.scene
{ Color } = pex.color

pex.sys.Window.create
  settings:
    width: 1200,
    height: 600,
    type: '3d',

  init: () ->
    @mesh = new Mesh(new Cube(1), new Test())
    @camera = new PerspectiveCamera(60, 200 / 200)
    @arcball = new Arcball(this, @camera, 2)

    @scene = new Scene()
    @scene.setClearColor(Color.Red)
    @scene.add(new Mesh(new Cube(), new Test()))
    @scene.add(@camera)
    @scene.setViewport(new Viewport(this, new Rect(0, 0, 200, 200)))

    @scene2 = new Scene()
    @scene2.setClearColor(Color.Green)
    @scene2.add(new Mesh(new Cube(), new Test()))
    @scene2.add(@camera)
    @scene2.setViewport(new Viewport(this, new Rect(0, 200, 200, 200)))

    @scene3 = new Scene()
    @scene3.setClearColor(Color.Blue)
    @scene3.add(new Mesh(new Cube(), new Test()))
    @scene3.setViewport(new Viewport(this, new Rect(0, 400, 200, 200)))

    @scene4 = new Scene()
    @scene4.setClearColor(Color.Grey)
    @scene4.add(new Mesh(new Cube(), new Test()))
    @scene4.setViewport(new Viewport(this, new Rect(200, 0, @width-200, @height)))

    #@scenes = (new Scene() for i in [0..2])

    #@cubeMesh = new Mesh(new Cube(), new Test())

    #@scenes[i].add(@cubeMesh) for i in [0..2]

    #@viewport1 = new Viewport(this, new Rect(0, 0, 200, 200));
    #@viewport2 = new Viewport(this, new Rect(0, 200, 200, 200));
    #@viewport3 = new Viewport(this, new Rect(0, 400, 200, 200));
    #@scene = new Scene()
    #@scene.add())

  draw: () ->
    @gl.enable(@gl.DEPTH_TEST)
    @gl.clearColor(0.0, 0.0, 0.0, 1)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

    #@viewport.bind()
    @scene.draw(@camera)
    @scene2.draw(@camera)
    @scene3.draw(@camera)
    @scene4.draw(@camera)
    #@viewport.unbind()
#
    #@viewport1.bind()
    #@gl.clearColor(1.0, 0.0, 0.0, 1)
    #@gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    #@mesh.draw(@camera)
    #@viewport1.unbind()
#
    #@viewport2.bind()
    #@gl.clearColor(1.0, 1.0, 0.0, 1)
    #@gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    #@mesh.draw(@camera)
    #@viewport2.unbind()
#
    #@viewport3.bind()
    #@gl.clearColor(1.0, 0.0, 1.0, 1)
    #@gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    #@mesh.draw(@camera)
    #@viewport3.unbind()
pex = pex || require('../../build/pex')

{ Vec3 } = pex.geom
{ LineBuilder, Cube } = pex.geom.gen
{ Color } = pex.color
{ Mesh, Texture2D } = pex.gl
{ ShowColors, SolidColor, Textured } = pex.materials
{ IO } = pex.sys
{ PerspectiveCamera, Arcball } = pex.scene

pex.sys.Window.create
  settings:
    width: 1200,
    height: 600,
    type: '3d',

  init: () ->
    @camera = new PerspectiveCamera(60, 1)
    @arcball = new Arcball(this, @camera)
    @camera.setPosition(new Vec3(1, 1, 2))

    @gui = new pex.gui.GUI(this)
    @gui.addLabel("Img / tl 0, 0").setPosition(10, 10)
    @gui.addLabel("Img RT / tl 300, 0").setPosition(310, 10)
    @gui.addLabel("OpenGL / bl 0, 0").setPosition(10, 310)
    @gui.addLabel("RT / tl 300, 0").setPosition(610, 10)
    @gui.addLabel("RT RT / tl 300, 0").setPosition(910, 10)
    @gui.addLabel("RT Tex Cube / bl 300, 0").setPosition(610, 310)
    @gui.addLabel("Img Tex Cube / bl 300, 0").setPosition(910, 310)

    @bgCube = new Mesh(new Cube(100, 100, 100), new SolidColor())

    @screenshot = new pex.gl.ScreenImage(Texture2D.load('screenshot.png'), 0, 0, 300, 300, @width, @height)
    @rt = new pex.gl.RenderTarget(300, 300, { depth : true })
    @rtImage = new pex.gl.ScreenImage(@rt.getColorAttachement(0), 600, 0, 300, 300, @width, @height)

    @rtImg = new pex.gl.RenderTarget(300, 300, { depth : true })
    @rtImgFSQ = new pex.gl.ScreenImage(@screenshot.image, 0, 0, 1, 1, 1, 1)
    @rtImgImage = new pex.gl.ScreenImage(@rtImg.getColorAttachement(0), 300, 0, 300, 300, @width, @height)

    @rt2 = new pex.gl.RenderTarget(300, 300, { depth : true })
    @rtFSQ2 = new pex.gl.ScreenImage(@rt.getColorAttachement(0), 0, 0, 1, 1, 1, 1)
    @rtImage2 = new pex.gl.ScreenImage(@rt2.getColorAttachement(0), 900, 0, 300, 300, @width, @height)

    @texCube = new Mesh(new Cube(1, 1, 1), new Textured({texture:@rt.getColorAttachement(0)}))

    lineBuilder = new LineBuilder()
    lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(1, 0, 0), Color.Red)
    lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(0, 1, 0), Color.Green)
    lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(0, 0, 1), Color.Blue)
    @lineMesh = new Mesh(lineBuilder, new ShowColors(), { useEdges: true})

  draw: () ->
    @gl.enable(@gl.DEPTH_TEST)
    @gl.clearColor(0.0, 0.0, 0.0, 1)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @gl.clearColor(0.5, 0.5, 0.5, 1)
    @gl.lineWidth(4)

    #screenshot
    @gl.viewport(0, 0, @width, @height)
    @screenshot.draw()

    #draw
    @gl.viewport(0, 0, 300, 300)
    @bgCube.material.uniforms.color = new Color(0.6, 0.5, 0.5, 1.0)
    @bgCube.draw(@camera)
    @lineMesh.draw(@camera)

    #rtImgDraw
    @gl.viewport(0, 0, 300, 300)
    @rt.bind()
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @bgCube.material.uniforms.color = new Color(0.6, 0.6, 0.5, 1.0)
    @bgCube.draw(@camera)
    @lineMesh.draw(@camera)
    @rt.unbind()
    @gl.viewport(0, 0, @width, @height)
    @rtImage.draw()

    #rtDraw
    @gl.viewport(0, 0, 300, 300)
    @rtImg.bind()
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @rtImgFSQ.draw()
    @rtImg.unbind()
    @gl.viewport(0, 0, @width, @height)
    @rtImgImage.draw()

    #textCube
    @gl.viewport(600, 0, 300, 300)
    @bgCube.material.uniforms.color = new Color(0.5, 0.5, 0.6, 1.0)
    @bgCube.draw(@camera)
    @texCube.draw(@camera)

    #textCube2
    @gl.viewport(900, 0, 300, 300)
    @bgCube.material.uniforms.color = new Color(0.5, 0.5, 0.6, 1.0)
    @bgCube.draw(@camera)
    @texCube.draw(@camera)

    #rtDraw2
    @gl.viewport(0, 0, 300, 300)
    @rt2.bind()
    @gl.clearColor(0.0, 0.0, 1.0, 1)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @rtFSQ2.draw()
    @rt2.unbind()
    @gl.viewport(0, 0, @width, @height)
    @rtImage2.draw()

    @gl.viewport(0, 0, @width, @height)
    @gl.disable(@gl.DEPTH_TEST)
    @gui.draw()

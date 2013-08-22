pex = pex || require('../../build/pex')

{ Scene, PerspectiveCamera, Arcball } = pex.scene
{ Mesh, Viewport } = pex.gl
{ SolidColor, Diffuse } = pex.materials
{ Color } = pex.color
{ Rect, hem } = pex.geom
{ Plane, Cube, Tetrahedron, Octahedron, Icosahedron, Dodecahedron, HexSphere, Sphere  } = pex.geom.gen

shapes = [Plane, Cube, Tetrahedron, Octahedron, Icosahedron, Dodecahedron, HexSphere, Sphere]
shapesPerRow = 4
viewportSize = 256
windowWidth  = viewportSize * shapesPerRow
windowHeight  = viewportSize * Math.ceil(shapes.length/shapesPerRow)

pex.sys.Window.create
  settings:
    width: windowWidth
    height: windowHeight
    fullscreen: pex.sys.Platform.isBrowser
  init: () ->
    @camera = new PerspectiveCamera(60, 1)
    @arcball = new Arcball(this, @camera)
    @scene = new Scene()

    @objects = []

    for shape, i in shapes
      geom = null
      if shape == Plane
        geom = new Plane(1, 1, 3, 3)
      else if shape == Cube
        geom = new Cube(1, 1, 1, 3, 3, 3)
      else
        geom = hem().fromGeometry(new shape()).triangulate().toFlatGeometry()

      geom.computeEdges()

      x = i % shapesPerRow
      y = Math.floor(i / shapesPerRow)
      obj = {
        solid: new Mesh(geom, new Diffuse({diffuseColor:new Color(0.2, 0.2, 0.2, 0.2)})),
        wireframe: new Mesh(geom, new SolidColor({color:Color.Yellow}), { useEdges: true}),
        viewport: new Viewport(this, new Rect(viewportSize * x, viewportSize * y, viewportSize, viewportSize))
      }
      @objects.push(obj)

  draw: () ->
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @gl.enable(@gl.DEPTH_TEST)

    for obj in @objects
      obj.viewport.bind()
      obj.solid.draw(@camera)
      obj.wireframe.draw(@camera)
      obj.viewport.unbind()
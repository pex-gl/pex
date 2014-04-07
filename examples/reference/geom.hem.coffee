pex = pex || require('../../build/pex')

{ Scene, PerspectiveCamera, Arcball } = pex.scene
{ Mesh, Viewport } = pex.gl
{ SolidColor, Diffuse } = pex.materials
{ Color } = pex.color
{ Rect, hem } = pex.geom
{ Plane, Cube, Tetrahedron, Octahedron, Icosahedron, Dodecahedron, HexSphere, Sphere  } = pex.geom.gen

numRows = 2
numCols = 4
viewportSize = 256
windowWidth  = viewportSize * numCols
windowHeight  = viewportSize * numRows

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

    for i in [0...numCols*numRows]

      if i == 0
        geom = hem().fromGeometry(new Cube()).toFlatGeometry()
      else if i == 1
        geom = hem().fromGeometry(new Cube()).subdivide().toFlatGeometry()
      else if i == 2
        geom = hem().fromGeometry(new Cube()).smoothDooSabin().toFlatGeometry()
      else if i == 3
        geom = hem().fromGeometry(new Cube())
        geom.vertices[0].sharp = true
        geom.subdivide().subdivide().subdivide()
        geom = geom.toFlatGeometry()
      else if i == 4
        geom = hem().fromGeometry(new Cube(1, 0.1, 1, 1, 1, 3))
        geom.vertices[0].sharp = true
        geom.subdivide().subdivide().subdivide()
        geom = geom.toFlatGeometry()
      else if i == 5
        geom = hem().fromGeometry(new Cube(1, 0.1, 1, 3, 1, 3))
        geom.selectFacesBy((f) ->
          c = f.getCenter()
          n = f.getNormal()
          return c.length() < 0.1 && n.y > 0
        )
        geom.extrude(0.5)
        geom = geom.toFlatGeometry()
      else if i == 6
        geom = hem().fromGeometry(new Cube(1, 1, 1, 3, 3, 3))
        geom.subdivide()
        geom.selectRandomFaces()
        geom.extrude(0.15)
        geom = geom.toFlatGeometry()
      else if i == 7
        geom = hem().fromGeometry(new Cube(1))
        geom.faces[0].edgePairLoop (e, ne) -> e.sharp = true; e.pair.sharp = true
        geom.subdivide().subdivide()
        geom = geom.toFlatGeometry()
      else continue

      geom.computeEdges()

      x = i % numCols
      y = Math.floor(i / numCols)
      obj = {
        solid: new Mesh(geom, new Diffuse({diffuseColor:new Color(0.2, 0.2, 0.2, 0.2)})),
        wireframe: new Mesh(geom, new SolidColor({color:Color.Yellow}), { useEdges: true}),
        viewport: new Viewport(this, new Rect(viewportSize * x, viewportSize * y, viewportSize, viewportSize))
      }
      @objects.push(obj)

  draw: () ->
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
    @gl.enable(@gl.DEPTH_TEST)
    @gl.lineWidth(2)

    for obj in @objects
      obj.viewport.bind()
      obj.solid.draw(@camera)
      obj.wireframe.draw(@camera)
      obj.viewport.unbind()
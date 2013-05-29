pex = pex || require('../../build/pex')

{ hem, Vec3, Vec4 } = pex.geom
{ Color } = pex.color
{ Camera, Arcball } = pex.scene
{ ShowNormals, Diffuse } = pex.materials
{ Time } = pex.utils
{ Cube, Sphere } = pex.geom.gen
{ Mesh } = pex.gl

class Turtle
  constructor: (@hem, @face) ->
    @direction = Vec3.create().copy(face.getNormal())
    center = face.getCenter()
    avgDist = 0;
    vertices = face.getAllVertices();
    distances = vertices.map (v) ->
      dist = v.position.distance(center)
      avgDist += dist
    @avgDist = avgDist / vertices.length;
    @radiusScale = 1

  move: (distance) ->
    @hem
      .clearFaceSelection()
      .selectFace(@face)
      .extrude(distance)

    distances = @distances;
    center = @face.getCenter();
    radiusScale = @radiusScale;
    avgDist = @avgDist;
    @face.getAllVertices().forEach (v, i) ->
      v.position
        .sub(center)
        .normalize()
        .scale(avgDist * radiusScale)
        .add(center)

pex.sys.Window.create
  settings:
    width: 1280
    height: 720
    type: '3d'
    vsync: true
    multisample: true
    fullscreen: false
    center: true

  totalLength: 0

  init: () ->
    @gl.clearColor(0, 0, 0, 1)
    @gl.enable(@gl.DEPTH_TEST)

    @camera = new Camera(60, this.width/this.height)
    @arcball = new Arcball(this, this.camera, 3)
    @material = new ShowNormals()
    @selectionMaterial = new Diffuse({ ambientColor : Color.create(0.2, 0, 0, 1), diffuseColor : Color.create(1, 0, 0, 1) })

    @framerate(30)

    @hem = hem().fromGeometry(new Cube(1, 1, 1))
    @mesh = new Mesh(@hem.toFlatGeometry(), @material)
    @hem.selectRandomFaces().subdivide().selectRandomFaces(1000)
    #@hem.triangulate().toFlatGeometry(@mesh.geometry)
    #@mesh = new Mesh(@hem.extrude(1).triangulate().toFlatGeometry(), @material)
    selectedFaces = @hem.getSelectedFaces()
    #@hem.triangulate().extrude(1).triangulate()

    @turtles = selectedFaces.map (face) => new Turtle(@hem, face)

    @on 'keyDown', (e) =>
      switch e.str
        when 'e'
          @hem.extrude(1)
          @hem.toFlatGeometry(@mesh.geometry)

      switch e.keyCode
        when 48  #TAB
          @hem.subdivide()
          @hem.toFlatGeometry(@mesh.geometry)

  draw: () ->
    if this.totalLength < 1 && Time.frameNumber % 5 == 0
      tmp = Vec3.create();
      @turtles.forEach (turtle, i) ->
        if Time.seconds < 2
          turtle.move(0.1)
        turtle.radiusScale = 0.02 + 0.8 * Math.random()
        turtle.move(0.1)
        turtle.move(0.1)
        turtle.move(0.1)
        turtle.radiusScale *= 1.5
        turtle.move(0.1)
        turtle.radiusScale *= 1.5
        turtle.move(0.1)
        turtle.radiusScale *= 1.5
        turtle.move(0.1)
        turtle.radiusScale *= 0.8
        turtle.move(0.05)
        turtle.radiusScale *= 0.8
        turtle.move(0.05)
        turtle.radiusScale *= 0.8
        turtle.move(-0.05)
        turtle.radiusScale *= 0.1
        turtle.move(-0.5)
        turtle.move(0.6)
        turtle.radiusScale *= 2
        turtle.move(0.1)
        turtle.radiusScale *= 2
        turtle.move(0.1)
        turtle.radiusScale *= 2
        turtle.move(0.1)
      #@hem.triangulate().toFlatGeometry(@mesh.geometry)
      @mesh = new Mesh(@hem.triangulate().toFlatGeometry(), @material)
      @totalLength += 10.2

    @gl.clearColor(0, 0, 0, 1);
    @gl.depthFunc(@gl.LEQUAL);
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT);

    @mesh.draw(@camera) if @mesh
    @selectionMesh.draw(@camera) if @selectionMesh
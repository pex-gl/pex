pex = pex || require('../../build/pex')

{ Vec3, hem, Plane } = pex.geom
{ LineBuilder, Cube } = pex.geom.gen
{ Color } = pex.color
{ Mesh, Texture2D } = pex.gl
{ ShowColors, SolidColor } = pex.materials
{ PerspectiveCamera, Arcball } = pex.scene

pex.require ['Plane', 'Line3d'], (Plane, Line3D) ->
  pex.sys.Window.create
    settings:
      width: 1280
      height: 720
      type: '3d'
    init: () ->
      geom = new Cube()
      geom.computeEdges()
      hemesh = hem().fromGeometry(geom)

      lineBuilder = new LineBuilder()

      plane = new Plane(Vec3.create(0, 0.2, 0), Vec3.create(0.7, 1, 0).normalize())

      numFaces = hemesh.faces.length
      hemesh.faces.forEach (face, faceIndex) ->
        if faceIndex >= numFaces then return
        hits = []
        if faceIndex==3 then console.log('face', faceIndex + '/' + hemesh.faces.length)
        face.edgePairLoop (e, ne) ->
          edgeLine = new Line3D(e.vert.position, ne.vert.position)
          if faceIndex==3 then console.log('line', e.vert.position.toString(), ne.vert.position.toString())
          p = plane.intersectSegment(edgeLine)
          if faceIndex==3 then console.log(' ', p.toString(), p.ratio) if p
          if p and p.ratio >= 0 && p.ratio <= 1
            if hits.length == 0 || !hits[hits.length-1].point.equals(p)
              hits.push({edge:e, point:p, ratio: p.ratio})
          lineBuilder.addCross(p, 0.05, Color.Red) if p
        if faceIndex==3 then console.log(' ', hits.length, 'hits', hits.map (v) -> [v.point.toString(), v.ratio])
        if hits.length > 2
          if hits[0].point.equals(hits[1].point) || hits[0].point.equals(hits[2].point)
            hits.splice(0, 1)
            if faceIndex==3 then console.log(' ', hits.length, 'hits', hits.map (v) -> v.point.toString())

        if hits.length == 2
          console.log(' split')
          splitEdge0 = hits[0].edge
          splitEdge1 = hits[1].edge
          if hits[0].ratio > 0
            hemesh.splitEdge(splitEdge0, hits[0].ratio)
            splitEdge0 = splitEdge0.next
          if hits[1].ratio > 0
            hemesh.splitEdge(splitEdge1, hits[1].ratio)
            splitEdge1 = splitEdge1.next
          hemesh.splitFace(splitEdge0, splitEdge1)

      hemesh.edges.map (e) ->
        lineBuilder.addLine(e.vert.position, e.next.vert.position, Color.White)

      hemesh.faces.map (face, faceIndex) ->
        c = face.getCenter()
        d = 0.05
        center = face.getCenter()
        faceColor = if plane.isPointAbove(center) then Color.Red else Color.Yellow
        face.edgePairLoop (e, ne) ->
          v = e.vert.position.dup().scale(1-d).add(c.dup().scale(d))
          nv = ne.vert.position.dup().scale(1-d).add(c.dup().scale(d))
          lineBuilder.addLine(v, nv, faceColor)
          lineBuilder.addCross(v, 0.02, Color.Orange)

      @mainMesh = new Mesh(lineBuilder, new ShowColors(), { useEdges: true })

      @camera = new PerspectiveCamera(60, @width/@height, 0.1, 100)
      @arcball = new Arcball(this, @camera)

    draw: () ->
      @gl.clearColor(0,0,0,1);
      @gl.clear(@gl.COLOR_BUFFER_BIT);
      @mainMesh.draw(@camera)


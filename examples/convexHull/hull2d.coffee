# based on Wikipedia http://en.wikipedia.org/wiki/QuickHull

pex = require('../../build/pex')

{ Rect, Vec2, Edge, Line2D, Triangle2D } = pex.geom
{ MathUtils } = pex.utils

sigstep = 1


#TODO: cleanup remove resultA, increasedDises etc
pex.sys.Window.create
  settings:
    width: 640 * 0.75
    height: 1136 * 0.75
    type: '2d'
  points: []
  edges: []
  numPoints: 100

  init: () ->
    pex.utils.MathUtils.seed(0)
    bounds = new Rect(this.width*0.2, this.width*0.2, this.width - this.width*0.4, this.height - this.width*0.4)
    center = new Vec2(this.width/2, this.height/2)
    for i in [0..@numPoints-1] by 1
      p = MathUtils.randomVec2InRect(bounds)
      if p.distance(center) > @height / 2
        i--
        continue
      @points.push(p)
    @quickHull(@points)

    @on 'leftMouseDown', (e) =>
      @points.push(Vec2.create(e.x, e.y))
      @quickHull(@points)

    @on 'mouseDragged', (e) =>
      @points.push(Vec2.create(e.x, e.y))
      @quickHull(@points)

    @on 'keyDown', (e) =>
      if e.str == ' '
        this.points = []
        this.edges = []
      @quickHull(@points)

  drawPoint: (p) ->
    color = [255, 0,   0, 255]
    color = [0,   0, 255, 255] if p.used is 1
    color = [0,   0,   0, 255] if p.used is -1
    @paint.setFlags(@paint.kAntiAliasFlag)
    @paint.setStroke()
    @paint.setStrokeWidth(2)
    @paint.setColor(color[0], color[1], color[2], color[3])
    @canvas.drawLine(@paint, p.x - 3, p.y - 3, p.x + 3, p.y + 3)
    @canvas.drawLine(@paint, p.x + 3, p.y - 3, p.x - 3, p.y + 3)

  drawEdge: (edge, i) ->
    a = edge.a
    b = edge.b
    #  var alpha = edge[2]
    alpha = 255
    @paint.setFlags(@paint.kAntiAliasFlag)
    @paint.setStroke()
    @paint.setStrokeWidth(1)
    @paint.setColor(0, 200, 0, alpha)
    @canvas.drawLine(@paint, a.x, a.y, b.x, b.y)
    @paint.setFill()
    @paint.setColor(255, 0, 0, 255)
    @canvas.drawText(@paint, "" + i, (a.x + b.x)/2, (a.y + b.y)/2)

  draw: () ->
    #@quickHull(@points)

    @canvas.clear(250, 250, 220, 255)

    @points.forEach(@drawPoint.bind(this))
    @edges.forEach(@drawEdge.bind(this))

  quickHull: (points) ->
    return if points.length is 0

    points.forEach((p) -> p.used = 0)

    notUsed = (p) -> !p.used
    neg = (f) -> (p) -> !f(p)
    isLeft = (line) -> (p) -> line.isPointOnTheLeftSide(p)
    swap = (arr, i, j) ->
      tmp = arr[i]
      arr[i] = arr[j]
      arr[j] = tmp

    edgePoints = []
    edges = []

    # find points most left and most right
    minX = 0 # index of point with min x
    maxX = 0 # index of point with max x

    points.forEach (p, i) ->
      minX = i if p.x < points[minX].x
      maxX = i if p.x > points[maxX].x

    points[minX].used = 1
    points[maxX].used = 1

    dividingLine = new Line2D(points[minX], points[maxX])
    edgePoints.push(points[minX])
    edgePoints.push(points[maxX])
    dividingEdge = new Edge(points[minX], points[maxX])
    #edges.push(dividingEdge)

    quickHullStep = (points, edgePoints, dividingLine, dividingEdge, depth) ->
      leftPoints = points.filter(isLeft(dividingLine))
      rightPoints = points.filter(neg(isLeft(dividingLine)))
      numEdgePoints = edgePoints.length

      findFurthestPoint = (max, p) ->
        dist = dividingLine.distanceToPoint(p)
        if dist >= max.distance
          max.distance = dist
          max.point = p
        max

      cleanSide = (sidePoints, left) ->
        return 0 if sidePoints.length == 0

        max = sidePoints.reduce(findFurthestPoint, { distance : 0, point : null })

        max.point.used = 1
        sidePoints.splice(sidePoints.indexOf(max.point), 1)
        edgePoints.push(max.point)
        projectedMaxPoint = dividingLine.projectPoint(max.point)
        dividingEdgeA = new Edge(dividingLine.a, max.point)
        dividingEdgeB = new Edge(dividingLine.b, max.point)

        edges.push(dividingEdgeA)
        edges.push(dividingEdgeB)

        triangle = new Triangle2D(max.point, dividingLine.a, dividingLine.b)
        sidePoints.forEach((p) -> p.used = -1 if triangle.contains(p))

        sidePoints = sidePoints.filter(notUsed)

        paLine = new Line2D(dividingLine.a, max.point)
        paPoints = sidePoints.filter((p) -> paLine.isPointOnTheLeftSide(p) == left)

        pbLine = new Line2D(dividingLine.b, max.point)
        pbPoints = sidePoints.filter((p) -> pbLine.isPointOnTheLeftSide(p) != left)

        resultA = quickHullStep(paPoints, edgePoints, paLine, dividingEdgeA, depth + 1)
        resultB = quickHullStep(pbPoints, edgePoints, pbLine, dividingEdgeB, depth + 1)

        edges.splice(edges.indexOf(dividingEdgeA), 1) if (paPoints.length > 0)
        edges.splice(edges.indexOf(dividingEdgeB), 1) if (pbPoints.length > 0)


      cleanSide(leftPoints, true)
      if edgePoints.length > numEdgePoints
        numEdgePoints = edgePoints.length

      cleanSide(rightPoints, false)
      if edgePoints.length > numEdgePoints
        numEdgePoints = edgePoints.length

    quickHullStep(points.filter(notUsed), edgePoints, dividingLine, dividingEdge, 0)

    #ordering edges
    for i in [0..edges.length-1] by 1
      edge = edges[i]
      start = edge.a
      end = edge.b
      for j in [i+1..edges.length-1] by 1
        nextEdge = edges[j]
        if nextEdge.a == end
          swap(edges, i+1, j)
        else if nextEdge.b == end
          swap(edges, i+1, j)
          a = nextEdge.a
          b = nextEdge.b
          nextEdge.a = b
          nextEdge.b = a

    @edges = edges

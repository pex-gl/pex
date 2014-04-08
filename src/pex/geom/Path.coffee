define (require) ->
  Vec3 = require('pex/geom/Vec3')

  class Path
    constructor: (points) ->
      @points = points || []
      @dirtyLength = true
      @loop = false
      @samplesCount = 200

    addPoint: (p) ->
      @points.push(p)


    getPoint: (t, debug) ->
      #t = (t + 1 ) % 1

      point = t * (@points.length - 1)
      intPoint = Math.floor( point )
      weight = point - intPoint

      #if debug then console.log('getPoint', t, intPoint, point, weight)

      c0 = intPoint
      c1 = intPoint + 1
      if intPoint == @points.length - 1
        c0 = intPoint
        c1 = intPoint

      vec = new Vec3()
      vec.x = @points[ c0 ].x + (@points[ c1 ].x - @points[ c0 ].x) * weight
      vec.y = @points[ c0 ].y + (@points[ c1 ].y - @points[ c0 ].y) * weight
      vec.z = @points[ c0 ].z + (@points[ c1 ].z - @points[ c0 ].z) * weight

      return vec

    getPointAt: ( d ) ->
      d = Math.max(0, Math.min(d, 1)) if !@loop
      #d = (d + 1 ) % 1 if @loop

      @precalculateLength() if @dirtyLength
      k = 0

      for i in [0..@accumulatedLengthRatios.length]
        if @accumulatedLengthRatios[i] >= d
          k = @accumulatedRatios[i]
          break

      #console.log(k, d)

      @getPoint(k, true)

    close: () ->
      @loop = true

    isClosed: () ->
      @loop

    reverse: () ->
      @points = @points.reverse()
      @dirtyLength = true


    precalculateLength: () ->
      step = 1/@samplesCount
      k = 0
      totalLength = 0
      @accumulatedRatios = []
      @accumulatedLengthRatios = []
      @accumulatedLengths = []

      point = null
      prevPoint = null
      for i in [0..@samplesCount]
        prevPoint = point
        point = @getPoint(k)

        if i > 0
          len = point.dup().sub(prevPoint).length()
          totalLength += len

        @accumulatedRatios.push(k)
        @accumulatedLengths.push(totalLength)

        k += step

      for i in [0..@accumulatedLengths.length-1]
        @accumulatedLengthRatios.push(@accumulatedLengths[i] / totalLength)

      @length = totalLength
      @dirtyLength = false

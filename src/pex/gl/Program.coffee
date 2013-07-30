define (require) ->
  Context = require('pex/gl/Context')
  IO = require('pex/sys/IO')
  Log = require('pex/utils/Log')

  kVertexShaderPrefix   = '' +
    '#ifdef GL_ES\n' +
    'precision highp float;\n' +
    '#endif\n' +
    '#define VERT\n';

  kFragmentShaderPrefix = '' +
    '#ifdef GL_ES\n' +
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
    '  precision highp float;\n' +
    '#else\n' +
    '  precision mediump float;\n' +
    '#endif\n' +
    '#endif\n' +
    '#define FRAG\n';

  class Program
    constructor: (vertSrc, fragSrc)->
      @gl = Context.currentContext.gl
      @handle = @gl.createProgram()
      @uniforms = {}
      @attributes = {}
      @addSources(vertSrc, fragSrc)
      @ready = false
      @link() if @vertShader and @fragShader

    addSources: (vertSrc, fragSrc) ->
      fragSrc ?= vertSrc;

      @addVertexSource(vertSrc) if vertSrc
      @addFragmentSource(fragSrc) if fragSrc

    addVertexSource: (vertSrc) ->
      @vertShader = @gl.createShader(@gl.VERTEX_SHADER);
      @gl.shaderSource(@vertShader, kVertexShaderPrefix + vertSrc + '\n')
      @gl.compileShader(@vertShader)
      if !@gl.getShaderParameter(@vertShader, @gl.COMPILE_STATUS)
        throw @gl.getShaderInfoLog(@vertShader)

    addFragmentSource: (fragSrc) ->
      @fragShader = @gl.createShader(@gl.FRAGMENT_SHADER);
      @gl.shaderSource(@fragShader, kFragmentShaderPrefix + fragSrc + '\n')
      @gl.compileShader(@fragShader)
      if !@gl.getShaderParameter(@fragShader, @gl.COMPILE_STATUS)
        throw @gl.getShaderInfoLog(@fragShader)

    link: () ->
      @gl.attachShader(@handle, @vertShader)
      @gl.attachShader(@handle, @fragShader)
      @gl.linkProgram(@handle)

      if !@gl.getProgramParameter(@handle, @gl.LINK_STATUS)
        throw @gl.getProgramInfoLog(handle)

      numUniforms = @gl.getProgramParameter(@handle, @gl.ACTIVE_UNIFORMS)

      for i in [0..numUniforms-1]
        info     = @gl.getActiveUniform(@handle, i);
        if info.size > 1
          for j in [0..info.size-1]
            arrayElementName = info.name.replace(/\[\d+\]/, '[' + j + ']')
            location = @gl.getUniformLocation(@handle, arrayElementName);
            @uniforms[arrayElementName] = Program.makeUniformSetter(@gl, info.type, location);
        else
          location = @gl.getUniformLocation(@handle, info.name);
          @uniforms[info.name] = Program.makeUniformSetter(@gl, info.type, location);

      numAttributes = @gl.getProgramParameter(@handle, @gl.ACTIVE_ATTRIBUTES)

      for i in [0..numAttributes-1]
        info     = @gl.getActiveAttrib(@handle, i);
        location = @gl.getAttribLocation(@handle, info.name);
        @attributes[info.name] = location;

      @ready = true
      this

    use: () ->
      @gl.useProgram(@handle);

    dispose: () ->
      @gl.deleteShader(this.vertShader)
      @gl.deleteShader(this.fragShader)
      @gl.deleteProgram(this.handle)

    @load: (url, callback, options) ->
      program = new Program()
      IO.loadTextFile(url, (source) ->
        Log.message("Program.Compiling #{url}")
        program.addSources(source)
        program.link()
        callback() if callback

        if options && options.autoreload
          IO.watchTextFile(url, (source) ->
            try
              program.gl.detachShader(program.handle, program.vertShader)
              program.gl.detachShader(program.handle, program.fragShader)
              program.addSources(source)
              program.link()
            catch e
              Log.message("Progra.load : failed to reload #{url}")
              Log.message(e)
          )
      )

    @makeUniformSetter = (gl, type, location) ->
      setterFun = null;
      switch type
        when gl.BOOL, gl.INT
          setterFun = (value) => gl.uniform1i(location, value)
        when gl.SAMPLER_2D, gl.SAMPLER_CUBE
          setterFun = (value) => gl.uniform1i(location, value)
        when gl.FLOAT
          setterFun = (value) -> gl.uniform1f(location, value)
        when gl.FLOAT_VEC2
          setterFun = (v) -> gl.uniform2f(location, v.x, v.y)
        when gl.FLOAT_VEC3
          setterFun = (v) -> gl.uniform3f(location, v.x, v.y, v.z)
        when gl.FLOAT_VEC4
          setterFun = (v) ->
            gl.uniform4f(location, v.r, v.g, v.b, v.a) if v.r?
            gl.uniform4f(location, v.x, v.y, v.z, v.w) if v.x?
        when gl.FLOAT_MAT4
          mv = new Float32Array(16)
          setterFun = (m) ->
            mv[0] = m.a11
            mv[1] = m.a21
            mv[2] = m.a31
            mv[3] = m.a41
            mv[4] = m.a12
            mv[5] = m.a22
            mv[6] = m.a32
            mv[7] = m.a42
            mv[8] = m.a13
            mv[9] = m.a23
            mv[10] = m.a33
            mv[11] = m.a43
            mv[12] = m.a14
            mv[13] = m.a24
            mv[14] = m.a34
            mv[15] = m.a44
            gl.uniformMatrix4fv(location, false, mv)

      if setterFun
        setterFun.type = type
        return setterFun
      else
        return () -> throw "Unknown uniform type: #{type}"
Embr.Program = (function(){

    var kShaderPrefix         = "#ifdef GL_ES\nprecision highp float;\n#endif\n"
    ,   kVertexShaderPrefix   = kShaderPrefix + "#define EM_VERTEX\n"
    ,   kFragmentShaderPrefix = kShaderPrefix + "#define EM_FRAGMENT\n"
    ,   includes = {};

    function processIncludes(src){
        var match, re = /^ *#include +"([\w\-\.]+)"/gm;
        while(match = re.exec(src)){
            var fn = match[1];
            if(fn in includes){
                var incl_src = includes[fn];
                src = src.replace(new RegExp(match[0]), incl_src);
                re.lastIndex = match.index + incl_src.length;
            }
        }
        return src;
    }

    function include(name, src){
        includes[name] = src;
    }


    function Program(gl, src_vertex, src_fragment){
        this.gl = gl;

        src_vertex   = processIncludes(src_vertex);
        src_fragment = src_fragment ? processIncludes(src_fragment) : src_vertex;

        var sv = this.shader_vert = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(sv, kVertexShaderPrefix + src_vertex);
        gl.compileShader(sv);
        if(gl.getShaderParameter(sv, gl.COMPILE_STATUS) !== true)
            throw gl.getShaderInfoLog(sv);

        var sf = this.shader_frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(sf, kFragmentShaderPrefix + src_fragment);
        gl.compileShader(sf);
        if(gl.getShaderParameter(sf, gl.COMPILE_STATUS) !== true)
            throw gl.getShaderInfoLog(sf);

        this.handle = gl.createProgram();
    }

    Program.prototype.link = function(){
        var gl     = this.gl
        ,   handle = this.handle;
        gl.attachShader(handle, this.shader_vert);
        gl.attachShader(handle, this.shader_frag);
        gl.linkProgram(handle);
        if(gl.getProgramParameter(handle, gl.LINK_STATUS) !== true)
            throw gl.getProgramInfoLog(handle);

        function makeUniformSetter(type, location){
            switch(type){
                case gl.BOOL:
                case gl.INT:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                    return function(value){
                        gl.uniform1i(location, value);
                        return this;
                    };
                case gl.FLOAT:
                    return function(value){
                        gl.uniform1f(location, value);
                        return this;
                    };
                case gl.FLOAT_VEC2:
                    return function(v){
                        gl.uniform2f(location, v.x, v.y);
                    };
                case gl.FLOAT_VEC3:
                    return function(v){
                        gl.uniform3f(location, v.x, v.y, v.z);
                    };
                case gl.FLOAT_VEC4:
                    return function(v){
                        gl.uniform4f(location, v.x, v.y, v.z, v.w);
                    };
                case gl.FLOAT_MAT4:
                    return function(mat4){
                        gl.uniformMatrix4fv(location, false, mat4.toFloat32Array());
                    };
            }
            return function(){
                throw "Unknown uniform type: " + type;
            };
        }

        this.uniforms  = {};
        this.locations = {};

        var nu = gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS);
        for(var i = 0; i < nu; ++i){
            var info     = gl.getActiveUniform(handle, i);
            var location = gl.getUniformLocation(handle, info.name);
            this.uniforms[info.name] = makeUniformSetter(info.type, location);
            this.locations[info.name] = location;
        }

        var na = gl.getProgramParameter(handle, gl.ACTIVE_ATTRIBUTES);
        for(var i = 0; i < na; ++i){
            var info     = gl.getActiveAttrib(handle, i);
            var location = gl.getAttribLocation(handle, info.name);
            this.locations[info.name] = location;
        }

        return this;
    };

    Program.prototype.use = function(){
        this.gl.useProgram(this.handle);
    };

    Program.prototype.useUniforms = function(obj){
        this.use();
        var uniforms = this.uniforms;
        for(var u in obj){
            uniforms[u](obj[u]);
        }
    };

    Program.prototype.dispose = function(){
        this.gl.deleteShader(this.shader_vert);
        this.gl.deleteShader(this.shader_frag);
        this.gl.deleteProgram(this.handle);
    };


    Program.include = include;


    return Program;

})();

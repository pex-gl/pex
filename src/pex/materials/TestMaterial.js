define(["pex/core/Core"], function(Core) {

  var solidColorVert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "attribute vec2 texCoord;"
    + "varying vec3 vNormal;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    +  "vNormal = normal;"
    +  "vTexCoord = texCoord;"
    + "}";

  var solidColorFrag = ""
    + "vec4 checker(vec2 uv) {"
    +   "float checkSize = 8.0;"
    +   "float fmodResult = mod(floor(checkSize * uv.x) + floor(checkSize * uv.y),2.0);"
    +   "if (fmodResult < 1.0) {"
    +     "return vec4(1, 1, 1, 1);"
    +   "} else {"
    +     "return vec4(0, 0, 0, 1);"
    +   "}"
    + "}"
    + "varying vec3 vNormal;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_FragColor.rgba = 0.25 * checker(vTexCoord);"
    +  "gl_FragColor.rgb += 0.5 * normalize(vNormal)*0.5 + 0.5;"
    +  "gl_FragColor.a = 1.0;"
    + "}";


  function TestMaterial() {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(solidColorVert, solidColorFrag);
  }

  TestMaterial.prototype = new Core.Material();

  return TestMaterial;
});
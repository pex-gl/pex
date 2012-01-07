//Super basic diffuse lighting.

//## Example use
//     var material = new DiffuseMaterial({
//       ambientColor: new Vec4(0, 0, 0, 1), //black
//       diffuseColor: new Vec4(1, 0.5, 0, 1), //orange
//       lightPos: new Vec3(5, 5, 5)
//     });

//##Reference
define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  //#### Vertex Shader    
  //Required VBO attributes:  
  //`position` - vertex normal *{Vec3}*  
  //`normal` - vertex position *{Vec3}*  
  //
  //Uniform variables:    
  //`projectionMatrix` - *{Mat4}* = *internal*  
  //`modelViewMatrix` - *{Mat4}* = *internal*
  //
  //*Note: Internal means it's handled automatically when using the Mesh class to render the geometry.*
  var vert = ""
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "vNormal = normal;"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    + "}";

  //#### Fragment Shader 
  //Uniform variables:   
  //`ambientColor` - base surface color *{ Vec4 }* = (0.2, 0.2, 0.2, 1)
  //`diffuseColor` - surface color when lit *{ Vec4 }* = (1, 1, 1, 1)  
  //`lightPos` - light position *{ Vec3 }* = (10, 10, 10) 
  var frag = ""
    + "uniform vec4 ambientColor;"
    + "uniform vec4 diffuseColor;"
    + "uniform vec3 lightPos;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "vec3 N = normalize(vNormal);"
    +  "vec3 L = normalize(lightPos);"
    +  "float NdotL = max(0.0, dot(N, L));"
    +  "gl_FragColor = ambientColor + diffuseColor * NdotL;"
    + "}";


  //### DiffuseMaterial ( uniforms )
  //`uniforms` - object with shader properties to overwrite the defaults *{ Object }*
  function DiffuseMaterial(uniforms) {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(vert, frag);

      var defaults = {
        ambientColor : new Core.Vec4(0.2, 0.2, 0.2, 1),
        diffuseColor : new Core.Vec4(1, 1, 1, 1),
        lightPos : new Core.Vec3(10, 10, 10)
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  DiffuseMaterial.prototype = new Core.Material();

  return DiffuseMaterial;
});
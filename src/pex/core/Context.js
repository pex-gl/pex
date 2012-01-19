//Utility class to keep track of current WebGL context so we don't have to 
//pass *gl* reference in every function and class that that is using it, like 
//*[Program](Program.html)* or *[Vbo](Vbo.html)*.

//## Example use
//     var gl = Core.Context.currentContext.gl;
//     gl.clearColor(0, 0, 0, 1);

//## Reference
define([], function() {
  //### Context
  //`gl` - OpenGL or WebGL context *{ GL }*  
  function Context(gl) {
    this.gl = gl;
  }

  //### currentContext
  //Static variable holding current *{ Context }* object linked with WebGL context *{ GL }*.  
  //Set by each *[Window](Window.html)* just before calling *draw()*.
  Context.currentContext.gl = null;

  return Context;
});
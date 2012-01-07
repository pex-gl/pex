//Utility class to keep track of current WebGL context so we don't have to 
//pass *gl* reference in every function and class that that is using it, like 
//*[Program](Program.html)* or *[Vbo](Vbo.html)*.

//## Example use
//     var gl = Context.currentContext;
//     gl.clearColor(0, 0, 0, 1);

//## Reference
define([], function() {
  //### Context
  //Empty constructor.
  function Context() {
  }

  //### currentContext
  //Static variable holding current WebGL context *{ GL }*.  
  //Set by each *[Window](Window.html)* just before calling *draw()*.
  Context.currentContext = null;

  return Context;
});
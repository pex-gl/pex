//Window represents a view backed up with a GL context.  
//It's implemented using Cocoa Window in Plask or HTML Canvas when in the web browser.

//## Example use
//     Window.create({
//       settings: {
//         width: 1280,
//         height: 720,
//         type: '3d',
//         vsync: true,    
//         multisample: true,
//         fullscreen: false,
//         center: true
//       },
//       init: function() {
//         var gl = Core.Core.Context.currentContext.gl;
//         gl.clearColor(0, 0, 0, 1);
//         this.framerate(30);
//       },
//       draw: function() {
//         var gl = Core.Core.Context.currentContext.gl;
//         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
//       }
//     });

//## Reference
define(["plask", "pex/core/Context"], function(plask, Context) {

  //### Window ( )
  //Empty constructor.  
  //
  //*Note: Use create(obj) instead.*
  function Window() {
  }

  //### create ( obj )
  //Creates new window instance.
  //
  //`obj` - program object object *{ Object }*
  //
  //Supported program object properties    
  //`settings` - window settings *{ Object }*
  //`init` - function called after window is created *{ function() }*  
  //`draw` - function called every frame *{ function() }*  

  Window.create = function(obj) {
    var gl = null;
    var context = null;

    /*We overwrite obj's init function to capture GL context before init() gets executed*/
    obj.__init = obj.init;
    obj.init = function() {
      gl = this.gl;
      require(["pex/core/Context"], function(Context) {
        context = new Context(gl);
        Context.currentContext.gl = context;
        if (obj.__init) {
          obj.framerate(60); //default to 60fps
          obj.__init();
        }
      });
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Context.currentContext.gl = context;
      if (obj.__draw) {
        obj.__draw();
      }
    }

    return plask.simpleWindow(obj);
  }

  return Window;

});
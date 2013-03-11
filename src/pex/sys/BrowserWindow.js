define(['pex/sys/Platform', 'pex/sys/EjectaPolyfills'], function(Platform, EjectaPolyfills) {
  var requestAnimFrameFps = 60;

  if (Platform.isBrowser) {
    window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / requestAnimFrameFps);
              };
    })();
  }

  var eventListeners = [];

  function fireEvent(eventType, event) {
    for(var i=0; i<eventListeners.length; i++) {
      if (eventListeners[i].eventType == eventType) {
        eventListeners[i].handler(event);
      }
    }
  }

  function registerEvents(canvas) {
    makeMouseDownHandler(canvas);
    makeMouseUpHandler(canvas);
    makeMouseDraggedHandler(canvas);
    makeMouseMovedHandler(canvas);
    makeScrollWheelHandler(canvas);
    makeTouchDownHandler(canvas);
    makeTouchUpHandler(canvas);
    makeTouchMoveHandler(canvas);
    makeKeyDownHandler(canvas);
  }

  function makeMouseDownHandler(canvas) {
    canvas.addEventListener('mousedown', function(e) {
      fireEvent('leftMouseDown', {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeMouseUpHandler(canvas) {
    canvas.addEventListener('mouseup', function(e) {
      fireEvent('leftMouseUp', {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      })
    })
  }

  function makeMouseDraggedHandler(canvas) {
    var down = false;
    var px = 0;
    var py = 0;
    canvas.addEventListener('mousedown', function(e) {
      down = true;
      px = e.offsetX || e.clientX - e.target.offsetLeft;
      py = e.offsetY || e.clientY - e.target.offsetTop;
    });
    canvas.addEventListener('mouseup', function(e) {
      down = false;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (down) {
        var x = e.offsetX || e.clientX - e.target.offsetLeft;
        var y = e.offsetY || e.clientY - e.target.offsetTop;
        fireEvent('mouseDragged', {
          x: x,
          y: y,
          dx: x - px,
          dy: y - py,
          option: e.altKey,
          shift: e.shiftKey,
          control: e.ctrlKey
        });
        px = x;
        py = y;
      }
    })
  }

  function makeMouseMovedHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
      fireEvent('mouseMoved', {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeScrollWheelHandler(canvas) {
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel'
    document.addEventListener(mousewheelevt, function(e) {
      fireEvent('scrollWheel', {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY,
        dy: e.wheelDelta/10 || -e.detail/10,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
      e.preventDefault();
      return false;
    });
  }

  var lastTouch = null;
  function makeTouchDownHandler(canvas) {
    canvas.addEventListener('touchstart', function(e) {
      lastTouch = {
        clientX : e.touches[0].clientX,
        clientY : e.touches[0].clientY
      };
      fireEvent('leftMouseDown', {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        option: false,
        shift: false,
        control: false
      });
    })
  }

  function makeTouchUpHandler(canvas) {
    canvas.addEventListener('touchend', function(e) {
      fireEvent('leftMouseUp', {
        x: lastTouch ? lastTouch.clientX : 0,
        y: lastTouch ? lastTouch.clientY : 0,
        option: false,
        shift: false,
        control: false
      });
      lastTouch = null;
    })
  }

   function makeTouchMoveHandler(canvas) {
    canvas.addEventListener('touchmove', function(e) {
      lastTouch = {
        clientX : e.touches[0].clientX,
        clientY : e.touches[0].clientY
      };
      fireEvent('mouseDragged', {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        option: false,
        shift: false,
        control: false
      });
    })
  }

  function makeKeyDownHandler(canvas) {
    var timeout = 0;
    window.addEventListener('keydown', function(e) {
      timeout = setTimeout(function() {
        fireEvent('keyDown', {
          str: '',
          keyCode: e.keyCode,
          option: e.altKey,
          shift: e.shiftKey,
          control: e.ctrlKey
        }, 1);
      })
    })
    window.addEventListener('keypress', function(e) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = 0;
      }
      fireEvent('keyDown', {
        str: String.fromCharCode(e.charCode),
        keyCode: e.keyCode,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function simpleWindow(obj) {
    var canvas = obj.settings.canvas;

    if (!canvas && Platform.isEjecta) {
      canvas = document.getElementById('canvas');
    }
    else {
      canvas = document.createElement('canvas');
    }

    if (obj.settings.fullscreen) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      obj.settings.width = window.innerWidth;
      obj.settings.height = window.innerHeight;
    }

    if (Platform.isEjecta && (window.devicePixelRatio == 2)) {
      obj.settings.width *= 2;
      obj.settings.height *= 2;
    }

    canvas.width = obj.width = obj.settings.width || 800;
    canvas.height = obj.height = obj.settings.height || 600;
    canvas.style.backgroundColor = '#000000';

    if (!canvas.parentNode) {
      if (document.body) {
        document.body.appendChild(canvas);
      }
      else {
        window.addEventListener('load', function() {
          document.body.appendChild(canvas);
        }, false);
      }
    }

    registerEvents(canvas);

    if (obj.stencil === undefined) obj.stencil = false;

    var gl = null;
    try {
      gl = canvas.getContext('experimental-webgl', {antialias: true, premultipliedAlpha : true, stencil: obj.settings.stencil});
    }
    catch(err){
      console.error(err);
      return;
    }

    obj.framerate = function(fps) {
      requestAnimFrameFps = fps;
    }

    obj.on = function(eventType, handler) {
      eventListeners.push({eventType:eventType, handler:handler});
    }

    obj.gl = gl;
    obj.init();

    function drawloop() {
      obj.draw();
      requestAnimFrame(drawloop);
    }

    requestAnimFrame(drawloop);
  }

  var BrowserWindow = {
    simpleWindow : simpleWindow
  }

  return BrowserWindow;
});
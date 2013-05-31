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
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeMouseUpHandler(canvas) {
    canvas.addEventListener('mouseup', function(e) {
      fireEvent('leftMouseUp', {
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
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
      px = (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
      py = (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
    });
    canvas.addEventListener('mouseup', function(e) {
      down = false;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (down) {
        var x = (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
        var y = (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
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
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
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
        x: (e.offsetX || e.layerX) * window.devicePixelRatio,
        y: (e.offsetY || e.layerY) * window.devicePixelRatio,
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
        clientX : (e.touches[0].clientX) * window.devicePixelRatio,
        clientY : (e.touches[0].clientY) * window.devicePixelRatio
      };
      fireEvent('leftMouseDown', {
        x: (e.touches[0].clientX) * window.devicePixelRatio,
        y: (e.touches[0].clientY) * window.devicePixelRatio,
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
        clientX : (e.touches[0].clientX) * window.devicePixelRatio,
        clientY : (e.touches[0].clientY) * window.devicePixelRatio
      };
      fireEvent('mouseDragged', {
        x: (e.touches[0].clientX) * window.devicePixelRatio,
        y: (e.touches[0].clientY) * window.devicePixelRatio,
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

    obj.settings.width = obj.settings.width || 800;
    obj.settings.height = obj.settings.height || 600;

    if (obj.settings.fullscreen) {
       obj.settings.width = window.innerWidth;
       obj.settings.height = window.innerHeight;
    }

    if ((!canvas || !document.getElementById) && Platform.isEjecta) {
      canvas = document.getElementById('canvas');
      obj.settings.width = canvas.width;
      obj.settings.height = canvas.height;
    }
    else {
      canvas = document.createElement('canvas');
      canvas.width = obj.settings.width;
      canvas.height = obj.settings.height;
    }

    if (Platform.isEjecta && (window.devicePixelRatio == 2)) {
      canvas.width = obj.settings.width * 2;
      canvas.height = obj.settings.height * 2;
      canvas.style.width = obj.settings.width;
      canvas.style.height = obj.settings.height;
      obj.settings.width *= 2;
      obj.settings.height *= 2;
    }

    obj.width = obj.settings.width;
    obj.height = obj.settings.height;
    obj.canvas = canvas;

    canvas.style.backgroundColor = '#000000';

    function go() {
      if (obj.stencil === undefined) obj.stencil = false;
      if (obj.settings.fullscreen) {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
      }

      var gl = null;
      try {
        gl = canvas.getContext('experimental-webgl'); //, {antialias: true, premultipliedAlpha : true, stencil: obj.settings.stencil}
      }
      catch(err){
        console.error(err.message);
        return;
      }

      obj.framerate = function(fps) {
        requestAnimFrameFps = fps;
      }

      obj.on = function(eventType, handler) {
        eventListeners.push({eventType:eventType, handler:handler});
      }

      registerEvents(canvas);

      obj.gl = gl;
      obj.init();

      function drawloop() {
        obj.draw();
        requestAnimFrame(drawloop);
      }

      requestAnimFrame(drawloop);
    }

    if (!canvas.parentNode) {
      if (document.body) {
        document.body.appendChild(canvas);
        go();
      }
      else {
        window.addEventListener('load', function() {
          document.body.appendChild(canvas);
          go();
        }, false);
      }
    }
  }

  var BrowserWindow = {
    simpleWindow : simpleWindow
  }

  return BrowserWindow;
});
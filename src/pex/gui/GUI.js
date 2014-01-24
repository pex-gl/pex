define([
  'pex/gl/Context',
  'pex/gl/ScreenImage',
  'pex/utils/Time',
  'pex/gui/SkiaRenderer',
  'pex/gui/HTMLCanvasRenderer',
  'pex/geom/Rect',
  'pex/sys/IO',
  'pex/sys/Platform',
  'pex/geom/Vec2',
  'pex/gl/Texture2D'
],
function(Context, ScreenImage, Time, SkiaRenderer, HTMLCanvasRenderer, Rect, IO, Platform, Vec2, Texture2D) {
  function GUIControl(o) {
    for(var i in o) {
      this[i] = o[i];
    }
  }

  GUIControl.prototype.setPosition = function(x, y) {
    this.px = x;
    this.py = y;
  }

  GUIControl.prototype.getNormalizedValue = function(idx) {
    if (!this.contextObject) return 0;

    var val = this.contextObject[this.attributeName];

    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      if (this.type == 'multislider') {
        val = (val[idx] - options.min) / (options.max - options.min);
      }
      else {
        val = (val - options.min) / (options.max - options.min);
      }
    }
    return val;
  }

  GUIControl.prototype.setNormalizedValue = function(val, idx) {
    if (!this.contextObject) return;

    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      if (this.type == 'multislider') {
        var a = this.contextObject[this.attributeName];
        if (idx >= a.length) {
          return;
        }
        a[idx] = options.min + val * (options.max - options.min);
        val = a;
      }
      else {
        val = options.min + val * (options.max - options.min);
      }
      if (options && options.step) {
        val = val - val % options.step;
      }
    }
    this.contextObject[this.attributeName] = val;
  }

  GUIControl.prototype.getValue = function() {
    if (this.type == 'slider') {
      return this.contextObject[this.attributeName];
    }
    if (this.type == 'multislider') {
      return this.contextObject[this.attributeName];
    }
    else if (this.type == 'toggle') {
      return this.contextObject[this.attributeName];
    }
    else return 0;
  }

  GUIControl.prototype.getStrValue = function() {
    if (this.type == 'slider') {
      var str = '' + this.contextObject[this.attributeName];
      var dotPos = str.indexOf('.') + 1;
      if (dotPos == 0) return str + '.0';
      while(str.charAt(dotPos) == '0') {
        dotPos++;
      }
      return str.substr(0, dotPos+2);
    }
    else if (this.type == 'toggle') {
      return this.contextObject[this.attributeName];
    }
    else return '';
  }

  function GUI(window, x, y, scale) {
    this.gl = Context.currentContext.gl;
    this.window = window;
    this.x = (x == undefined) ? 0 : x;
    this.y = (y == undefined) ? 0 : y;
    this.mousePos = Vec2.create();
    this.scale = scale || 1;

    if (Platform.isPlask) {
      this.renderer = new SkiaRenderer(window.width, window.height);
    }
    else if (Platform.isBrowser) {
      this.renderer = new HTMLCanvasRenderer(window.width, window.height);
    }
    this.screenBounds = new Rect(this.x, this.y, window.width*this.scale, window.height*this.scale);
    this.screenImage = new ScreenImage(this.renderer.getTexture(), this.x, this.y, window.width, window.height, window.width, window.height);

    this.items = [];

    this.bindEventListeners(window);
  }

  GUI.prototype.bindEventListeners = function(window) {
    var self = this;
    window.on('leftMouseDown', function(e) {
      self.onMouseDown(e);
    });

    window.on('mouseDragged', function(e) {
      self.onMouseDrag(e);
    });

    window.on('leftMouseUp', function(e) {
      self.onMouseUp(e);
    });
  }

  GUI.prototype.onMouseDown = function(e) {
    this.activeControl = null;
    this.mousePos.set(e.x/this.scale - this.x, e.y/this.scale - this.y);
    for(var i=0; i<this.items.length; i++) {
      if (this.items[i].activeArea.contains(this.mousePos)) {
        this.activeControl = this.items[i];
        this.activeControl.active = true;
        this.activeControl.dirty = true;
        if (this.activeControl.type == 'button') {
          this.activeControl.contextObject[this.activeControl.methodName]();
        }
        else if (this.activeControl.type == 'toggle') {
          this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
          }
        }
        else if (this.activeControl.type == 'radiolist') {
          var hitY = this.mousePos.y - this.activeControl.activeArea.y;
          var hitItemIndex = Math.floor(this.activeControl.items.length * hitY/this.activeControl.activeArea.height);
          if (hitItemIndex < 0) continue;
          if (hitItemIndex >= this.activeControl.items.length) continue;
          this.activeControl.contextObject[this.activeControl.attributeName] = this.activeControl.items[hitItemIndex].value;
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.items[hitItemIndex].value);
          }
        }
        e.handled = true;
        this.onMouseDrag(e);
        break;
      }
    }
  }

  GUI.prototype.onMouseDrag = function(e) {
    if (this.activeControl) {
      var aa = this.activeControl.activeArea;
      if (this.activeControl.type == 'slider') {
        var val = (e.x/this.scale - aa.x) / aa.width;
        val = Math.max(0, Math.min(val, 1));
        this.activeControl.setNormalizedValue(val);
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
        this.activeControl.dirty = true;
      }
      else if (this.activeControl.type == 'multislider') {
        var val = (e.x/this.scale - aa.x) / aa.width;
        val = Math.max(0, Math.min(val, 1));
        var idx = Math.floor(this.activeControl.getValue().length * (e.y/this.scale - aa.y) / aa.height);
        this.activeControl.setNormalizedValue(val, idx);
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
        this.activeControl.dirty = true;
      }
      e.handled = true;
    }
  }

  GUI.prototype.onMouseUp = function(e) {
    if (this.activeControl) {
      this.activeControl.active = false;
      this.activeControl.dirty = true;
      this.activeControl = null;
    }
  }

  GUI.prototype.addLabel = function(title) {
    var ctrl = new GUIControl(
      { type: 'label', title: title, dirty : true,activeArea: new Rect(0, 0, 0, 0), setTitle: function(title) { this.title = title; this.dirty = true; } }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addParam = function(title, contextObject, attributeName, options, onchange) {
    options = options || {};
    if (contextObject[attributeName] instanceof Array) {
      var ctrl = new GUIControl(
        {
          type: 'multislider',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
      var ctrl = new GUIControl(
        {
          type: 'toggle',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else {
      var ctrl = new GUIControl(
        {
          type: 'slider',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
  }

  GUI.prototype.addButton = function(title, contextObject, methodName, options) {
    var ctrl = new GUIControl(
      {
        type: 'button',
        title: title,
        contextObject: contextObject,
        methodName: methodName,
        activeArea: new Rect(0, 0, 0, 0),
        dirty : true,
        options : options || {}
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addRadioList = function(title, contextObject, attributeName, items, onchange) {
    var ctrl = new GUIControl(
      {
        type: 'radiolist',
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: new Rect(0, 0, 0, 0),
        items: items,
        onchange : onchange,
        dirty : true
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addTexture2D = function(title, texture) {
    var ctrl = new GUIControl(
      {
        type: 'texture2D',
        title: title,
        texture: texture,
        activeArea: new Rect(0, 0, 0, 0),
        dirty : true
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.dispose = function() {
    //TODO: delete texture object
  }

  var frame = 0;
  GUI.prototype.draw = function() {
    if (this.items.length == 0) {
      return;
    }
    this.renderer.draw(this.items, this.scale);
    var gl = Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.screenImage.draw();
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    this.drawTextures();
  }

  GUI.prototype.drawTextures = function() {
    for(var i=0; i<this.items.length; i++) {
      var item = this.items[i];
      if (item.type == 'texture2D') {
        var bounds = new Rect(item.activeArea.x*this.scale, item.activeArea.y*this.scale, item.activeArea.width*this.scale, item.activeArea.height*this.scale);
        this.screenImage.setBounds(bounds);
        this.screenImage.setImage(item.texture);
        this.screenImage.draw();
      }
    }
    this.screenImage.setBounds(this.screenBounds);
    this.screenImage.setImage(this.renderer.getTexture());
  }

  GUI.prototype.serialize = function() {
    var data = {};
    this.items.forEach(function(item, i) {
      data[item.title] = item.getNormalizedValue();
    })
    return data;
  }

  GUI.prototype.deserialize = function(data) {
    this.items.forEach(function(item, i) {
      if (!(data[item.title] == undefined)) {
        item.setNormalizedValue(data[item.title]);
        item.dirty = true;
      }
    })
  }

  GUI.prototype.save = function(path) {
    var data = this.serialize();
    IO.saveTextFile(path, JSON.stringify(data));
  }

  GUI.prototype.load = function(path) {
    var self = this;
    IO.loadTextFile(path, function(dataStr) {
      var data = JSON.parse(dataStr);
      self.deserialize(data);
    })
  }

  GUI.ScreenImage = ScreenImage;

  return GUI;
});

define([
  "plask",
  "pex/core/Context",
  "pex/gui/ScreenImage",
  "pex/util/Time",
  "pex/gui/SkiaRenderer",
  "pex/gui/HTMLCanvasRenderer",
  "pex/gui/NodeCanvasRenderer",
  "pex/core/Rect",
  "pex/sys/IO"
],
function(plask, Context, ScreenImage, Time, SkiaRenderer, HTMLCanvasRenderer, NodeCanvasRenderer, Rect, IO) {
  function GUIControl(o) {
    for(var i in o) {
      this[i] = o[i];
    }
  }

  GUIControl.prototype.setPosition = function(x, y) {
    this.px = x;
    this.py = y;
  }

  GUIControl.prototype.getNormalizedValue = function() {
    if (!this.contextObject) return "";

    var val = this.contextObject[this.attributeName];
    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      val = (val - options.min) / (options.max - options.min);
    }
    return val;
  }

  GUIControl.prototype.setNormalizedValue = function(val) {
    if (!this.contextObject) return;

    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      val = options.min + val * (options.max - options.min);
    }
    this.contextObject[this.attributeName] = val;
  }

  GUIControl.prototype.getValue = function() {
    if (this.type == "slider") {
      return this.contextObject[this.attributeName];
    }
    else if (this.type == "toggle") {
      return this.contextObject[this.attributeName];
    }
    else return 0;
  }

  function GUI(window, x, y) {
    this.gl = Context.currentContext.gl;
    this.window = window;
    this.x = (x == undefined) ? 0 : x;
    this.y = (y == undefined) ? 0 : y;

    if (plask.SkCanvas) {
      this.renderer = new SkiaRenderer(window.width, window.height);
    }
    else if (IO.Image) {
      this.renderer = new NodeCanvasRenderer(window.width, window.height);
    }
    else {
      this.renderer = new HTMLCanvasRenderer(window.width, window.height);
    }
    this.screenBounds = new Rect(this.x, this.y, window.width, window.height);
    this.screenImage = new ScreenImage(window.width, window.height, this.x, this.y, window.width, window.height, this.renderer.getTexture());

    this.items = [];

    this.bindEventListeners(window);
  }

  GUI.prototype.bindEventListeners = function(window) {
    var self = this;
    window.on("leftMouseDown", function(e) {
      self.onMouseDown(e);
    });

    window.on("mouseDragged", function(e) {
      self.onMouseDrag(e);
    });

    window.on("leftMouseUp", function(e) {
      self.onMouseUp(e);
    });
  }

  GUI.prototype.onMouseDown = function(e) {
    this.activeControl = null;
    var mousePos = { x : e.x - this.x, y : e.y - this.y };
    for(var i=0; i<this.items.length; i++) {
      if (this.items[i].activeArea.contains(mousePos)) {
        this.activeControl = this.items[i];
        this.activeControl.active = true;
        this.activeControl.dirty = true;
        if (this.activeControl.type == "button") {
          this.activeControl.contextObject[this.activeControl.methodName]();
        }
        else if (this.activeControl.type == "toggle") {
          this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
          }
        }
        else if (this.activeControl.type == "radiolist") {
          var hitY = mousePos.y - this.activeControl.activeArea.y;
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
      if (this.activeControl.type == "slider") {
        var val = (e.x - aa.x) / aa.width;
        val = Math.max(0, Math.min(val, 1));
        this.activeControl.setNormalizedValue(val);
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
      this.activeControl = null;
    }
  }

  GUI.prototype.addLabel = function(title) {
    var ctrl = new GUIControl(
      { type: "label", title: title, activeArea: new Rect(0, 0, 0, 0), setTitle: function(title) { this.title = title; this.dirty = true; } }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addParam = function(title, contextObject, attributeName, options, onchange) {
    options = options || {};
    if (attributeName == "[]") {
      var ctrl = new GUIControl(
        {
          type: "multislider",
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
      var ctrl = new GUIControl(
        {
          type: "toggle",
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else {
      var ctrl = new GUIControl(
        {
          type: "slider",
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
  }

  GUI.prototype.addButton = function(title, contextObject, methodName) {
    var ctrl = new GUIControl(
      {
        type: "button",
        title: title,
        contextObject: contextObject,
        methodName: methodName,
        activeArea: new Rect(0, 0, 0, 0)
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addRadioList = function(title, contextObject, attributeName, items, onchange) {
    var ctrl = new GUIControl(
      {
        type: "radiolist",
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: new Rect(0, 0, 0, 0),
        items: items,
        onchange : onchange
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addTexture2D = function(title, texture) {
    var ctrl = new GUIControl(
      {
        type: "texture2D",
        title: title,
        texture: texture,
        activeArea: new Rect(0, 0, 0, 0)
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
    Time.update();
    this.renderer.draw(this.items);
    if (!IO.Image) this.screenImage.draw();
    this.drawTextures();
  }

  GUI.prototype.drawTextures = function() {
    for(var i=0; i<this.items.length; i++) {
      var item = this.items[i];
      if (item.type == "texture2D") {
        if (item.texture.bind) item.texture.bind();
        else {
          this.gl.bindTexture(item.texture.target, item.texture.handle);
        }
        var bounds;
        if (item.texture.flipped) {
          bounds  = new Rect(item.activeArea.x, this.window.height - item.activeArea.y, item.activeArea.width, -item.activeArea.height);
        }
        else {
          bounds = new Rect(item.activeArea.x, this.window.height - item.activeArea.y - item.activeArea.height, item.activeArea.width, item.activeArea.height);
        }
        this.screenImage.setBounds(bounds);
        this.screenImage.setTexture(null);
        this.screenImage.draw();
      }
    }
    this.screenImage.setBounds(this.screenBounds);
    this.screenImage.setTexture(this.renderer.getTexture());
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

define([
  "plask",
  "pex/core/Context",
  "pex/gui/ScreenImage",
  "pex/util/Time",
  "pex/gui/SkiaRenderer",
  "pex/gui/HTMLCanvasRenderer",
  "pex/core/Rect",
  "pex/sys/IO"
],
function(plask, Context, ScreenImage, Time, SkiaRenderer, HTMLCanvasRenderer, Rect, IO) {
  function GUIControl(o) {
    for(var i in o) {
      this[i] = o[i];
    }
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
    console.log(this.attributeName, val);
    this.contextObject[this.attributeName] = val;
  }

  GUIControl.prototype.getValue = function() {
    if (this.type == "slider") {
      return Math.floor(this.contextObject[this.attributeName]*100)/100;
    }
    else return 0;
  }

  function GUI(window, x, y) {
    this.gl = Context.currentContext.gl;
    this.x = (x == undefined) ? 0 : x;
    this.y = (y == undefined) ? 0 : y;

    if (plask.SkCanvas) {
      this.renderer = new SkiaRenderer(256, window.height);
    }
    else {
      this.renderer = new HTMLCanvasRenderer(256, window.height);
    }

    this.screenImage = new ScreenImage(window.width, window.height, this.x, this.y, 256, window.height, this.renderer.getTexture());

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
    var mousePos = { x : e.x - this.x, y : e.y - this.y }
    for(var i=0; i<this.items.length; i++) {
      if (this.items[i].activeArea.contains(mousePos)) {
        this.activeControl = this.items[i];
        this.activeControl.active = true;
        if (this.activeControl.type == "button") {
          this.activeControl.contextObject[this.activeControl.methodName]();
        }
        else if (this.activeControl.type == "toggle") {
          this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
        }
        else if (this.activeControl.type == "radiolist") {
          var hitY = mousePos.y - this.activeControl.activeArea.y;
          var hitItemIndex = Math.floor(this.activeControl.items.length * hitY/this.activeControl.activeArea.height);
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
    this.items.push(new GUIControl(
      { type: "label", title: title, activeArea: new Rect(0, 0, 0, 0) }
    ));
  }

  GUI.prototype.addParam = function(title, contextObject, attributeName, options) {
    options = options || {};
    if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
      this.items.push(new GUIControl(
        {
          type: "toggle",
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options
        })
      );
    }
    else {
      this.items.push(new GUIControl(
        {
          type: "slider",
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options
        })
      );
    }
  }

  GUI.prototype.addButton = function(title, contextObject, methodName) {
    this.items.push(new GUIControl(
      {
        type: "button",
        title: title,
        contextObject: contextObject,
        methodName: methodName,
        activeArea: new Rect(0, 0, 0, 0)
      })
    );
  }

  GUI.prototype.addRadioList = function(title, contextObject, attributeName, items) {
    this.items.push(new GUIControl(
      {
        type: "radiolist",
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: new Rect(0, 0, 0, 0),
        items: items
      })
    );
  }

  GUI.prototype.dispose = function() {
    //TODO: delete texture object
  }

  var frame = 0;
  GUI.prototype.draw = function() {
    Time.update();

    this.renderer.draw(this.items);
    this.screenImage.draw();
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

  return GUI;
});

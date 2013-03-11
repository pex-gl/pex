define(['pex/sys/Platform'], function(Platform) {
  if (!Platform.isEjecta) {
    return {};
  }

  HTMLElement.prototype.setAttribute = HTMLElement.prototype.setAttribute || function(name, value) {
    if (!this.attributes) this.attributes = {};
    this.attributes[name] = value;
  }

  HTMLElement.prototype.getAttribute = HTMLElement.prototype.getAttribute || function(name, value) {
    if (!this.attributes) return null;
    return this.attributes[name];
  }

  HTMLElement.prototype.addEventListener = HTMLElement.prototype.addEventListener || function(name, callback, useCapture) {
    if (name == 'load') {
      this.onload = function(e) {
        callback({
          type : 'load',
          currentTarget : this, 
          srcElement : this
        });
      }
    }
    else if (name == 'touchstart' || name == 'touchstart' || name == 'touchstart') {
      document.addEventListener(name, callback, useCapture);
    }
  }

  HTMLElement.prototype.removeEventListener = HTMLElement.prototype.removeEventListener || function(name, callback, useCapture) {
    if (name == 'load') {
      this.onload = null;
    }
    else if (name == 'touchstart' || name == 'touchstart' || name == 'touchstart') {
      document.removeEventListener(name, callback);
    }
  }

  return {};
});
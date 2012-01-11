//Node.js' Events module mockup just to make RequireJS happy when running in the browser.
define([], function() {
  function EventEmitter() {
    this.listeners = {};
  }
  
  EventEmitter.prototype.on = function(msgName, handler) {
    if (this.listeners[msgName] == undefined) {
      this.listeners[msgName] = [];
    }
    if (this.listeners[msgName].indexOf(handler) == -1) {
      this.listeners[msgName].push(handler)
    }
  }
  
  EventEmitter.prototype.emit = function(msgName, data) {
    if (this.listeners[msgName]) {
      for(var i in this.listeners[msgName]) {
        this.listeners[msgName][i](data);
      }
    }
  }
  
  return {
    EventEmitter: EventEmitter
  };
});
define([], function() {

  function FXResourceMgr() {
    this.cache = [];
  }

  FXResourceMgr.prototype.getResource = function(type, properties) {
    properties = properties || {};
    for(var i=0; i<this.cache.length; i++) {
      var res = this.cache[i];
      if (res.type == type && !res.used) {
        var areTheSame = true;
        for(var propName in properties) {
          if (properties[propName] != res.properties[propName]) {
            areTheSame = false;
          }
        }
        if (areTheSame) return res;
      }
    }
    return null;
  }

  FXResourceMgr.prototype.addResource = function(type, obj, properties) {
    var res = {
      type : type,
      obj : obj,
      properties : properties
    };
    this.cache.push(res);
    return res;
  }

  FXResourceMgr.prototype.markAllAsNotUsed = function() {
    for(var i=0; i<this.cache.length; i++) {
      this.cache[i].used = false;
    }
  }

  return FXResourceMgr;
})
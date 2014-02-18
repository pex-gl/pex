define([], function() {
  function ObjectUtils() {
  }

  ObjectUtils.mergeObjects = function(a, b) {
    var result = { };
    if (a) {
      for(var prop in a) {
        result[prop] = a[prop];
      }
    }
    if (b) {
      for(var prop in b) {
        result[prop] = b[prop];
      }
    }
    return result;
  };

  ObjectUtils.property = function(prop, value) {
    return function(object) {
      if (value !== undefined) {
        object[prop] = value;
        return object;
      }
      else {
        return object[prop];
      }
    };
  };

  return ObjectUtils;
});

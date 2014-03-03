define([], function() {
  function ObjectUtils() {
  }

  ObjectUtils.mergeObjects = function(a, b) {
    var result = {}, prop;
    if (a) {
      for(prop in a) {
        result[prop] = a[prop];
      }
    }
    if (b) {
      for(prop in b) {
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

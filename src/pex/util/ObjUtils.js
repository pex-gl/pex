define([], function() {
  function ObjUtils() {
  }

  //random unit vector on a sphere
  ObjUtils.mergeObjects = function(a, b) {
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
  }

  return ObjUtils;
});

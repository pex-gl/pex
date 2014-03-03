define([], function() {
  function ArrayUtils() {
  }

  ArrayUtils.range = function(start, end) {
    var result = [];
    for(var i=start; i<end; i++) {
      result.push(i);
    }
    return result;
  };

  ArrayUtils.shuffled = function(list) {
    var newList = ArrayUtils.range(0, list.length);
		var i;
    for(i=0; i<newList.length; i++) {
      var j = Math.floor(Math.random() * newList.length);
      var tmp = newList[i];
      newList[i] = newList[j];
      newList[j] = tmp;
    }
    for(i=0; i<newList.length; i++) {
      newList[i] = list[newList[i]];
    }
    return newList;
  };

  ArrayUtils.first = function(list, n) {
    n = n || 1;
    return list.slice(0, n);
  };

  return ArrayUtils;
});

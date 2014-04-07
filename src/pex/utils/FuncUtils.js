define([], function () {
  function FuncUtils() {
  }

  FuncUtils.not = function(x) {
    return !x;
  };

  FuncUtils.equal = function(a, b) {
    return a === b;
  };

  FuncUtils.autoCurry = function(func) {
    var len = func.length;
    var args = [];
    return function next() {
      args = args.concat(Array.prototype.slice.call(arguments));
      return args.length >= len ? func.apply(this, args.splice(0)) : next;
    };
  };

  FuncUtils.compose = function() {
    var funcs = Array.prototype.slice.apply(arguments);
    return function() {
      var args = Array.prototype.slice.apply(arguments);
      for (var i = funcs.length - 1; i >= 0; --i) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  FuncUtils.repeatedly = function(num, func) {
    var i = 0;
    var values = [];
    for (i = 0; i < num; ++i) {
      values.push(func(i));
    }
    return values;
  };

  FuncUtils.repeat = function(num, value) {
    return FuncUtils.repeatedly(num, function () {
      return value;
    });
  };

  FuncUtils.dispatch = function() {
    var funcs = Array.prototype.slice.apply(arguments);
    var len = funcs.length;
    return function (target) {
      var value;
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < len; ++i) {
        var func = funcs[i];
        value = func.apply(func, Array.prototype.concat(target, args));
        if (value)
          return value;
      }
      return value;
    };
  };

  return FuncUtils;
});

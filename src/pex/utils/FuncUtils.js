define([], function() {
  function FuncUtils() {
  }

  FuncUtils.autoCurry = function(func) {
    var len = func.length;
    var args = [];

    return function next() {
      args = args.concat(Array.prototype.slice.call(arguments));
      return (args.length >= len) ? func.apply(this, args.splice(0)) : next;
    }
  }

  FuncUtils.compose = function() {
    var funcs = Array.prototype.slice.apply(arguments);

    return function() {
      var args = Array.prototype.slice.apply(arguments);
      for (var i = funcs.length - 1; i >= 0; --i) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  }

  return FuncUtils;
});

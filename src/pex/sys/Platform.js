define([], function() {
  var isPlask = (typeof window === 'undefined') && (typeof process === 'object');
  var isBrowser = (typeof window === 'object') && (typeof document === 'object');
  var isEjecta = (typeof ejecta === 'object') && (typeof ejecta.include === 'function');
  return {
    isPlask : isPlask,
    isBrowser : isBrowser,
    isEjecta : isEjecta
  };
});

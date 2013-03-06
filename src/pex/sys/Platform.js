define([], function() {
  var isPlask = (typeof window === 'undefined') && (typeof process === 'object');
  var isBrowser = (typeof window === 'object') && (typeof document === 'object');
  return {
    isPlask : isPlask,
    isBrowser : isBrowser
  }
});
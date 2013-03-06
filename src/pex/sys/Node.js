define(["pex/sys/Platform"], function(Platform) {
  var include = (typeof pexNodeRequire === 'function') ? pexNodeRequire : require;
  return {
    plask : Platform.isPlask ? include('plask') : {},
    fs : Platform.isPlask ? include('fs') : {}
  }
})
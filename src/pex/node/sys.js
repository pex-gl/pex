//Node.js' Sys module mockup just to make RequireJS happy when running in the browser.
define([], function() {
  function inherits(child, parent) {
    child.prototype = new parent()
  }
  
  return {
    inherits: inherits
  };
});
/*

Usage:

<script src="../../src/pex/pex-webgl.js"></script>
<script>

Pex.ready(function() {
  Pex.require(["example"], function(example) {

  });
});
</script>

*/

var preloadCore;

//require js config object
var require = {
  //anti cache
  urlArgs: "bust=" +  (new Date()).getTime()
}

//Initialization code of Pex when running in the browser.

var Pex = {
  run: function(initModules, initCallback) {
    this.initModules = initModules;
    this.initCallback = initCallback;
  },
};

(function() {
  function findMe(tag, attr, file) {
    var tags = document.getElementsByTagName(tag);
    var r = new RegExp(file + '$');
    for (var i = 0;i < tags.length;i++) {
      if (r.exec(tags[i][attr])) {
        return tags[i][attr];
      }
    }
  };

  var src = findMe('script', 'src', 'pex-webgl.js');
  if (!src) {
    alert("pex-webgl.js source not found");
  }

  var path = src.replace("pex-webgl.js", "");

  require.baseUrl = '';
  require.paths = { "pex": path };
  require.priority = preloadCore ? [ path + "pex-core.js" ] : null,
  require.packages = [
    { name: "plask", location: path + "node", main: "plask" },
    { name: "fs", location: path + "node", main: "fs" },
    { name: "path", location: path + "node", main: "path" }
  ];
  require.ready = function() {
    Pex.require = require;
    Pex.require.pexBaseUrl = "";
    if (Pex.initModules && Pex.initCallback) {
      Pex.require(Pex.initModules, Pex.initCallback);
    }
  }

  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = path + (preloadCore ? "" : "lib/") + "require.js";
  head.appendChild(script);
})();
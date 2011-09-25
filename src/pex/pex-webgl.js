/*

Usage:

<script src="../../src/pex/pex-webgl.js"></script>
<script>

Pex.run("example");

or

Pex.ready(function() {
	Pex.require(["example"], function(example) {

	});
});
</script>

*/

//require js config object
var require = {
  //anti cache
  urlArgs: "bust=" +  (new Date()).getTime()
}

var Pex = {
  require: require,
  run: function(module) {
    this.runModule = module;
  },
  ready: function(handler) {
    this.readyHandler = handler;
  },
  window: function(obj) {
    require(["plask"], function(plask) {
      //we overwrite obj's init function to capture GL context before init() gets executed
      obj.__init = obj.init;
      obj.init = function() {
        var gl = this.gl;
        requirejs(["pex/core/Context"], function(Context) {
          Context.currentContext = gl;
          if (obj.__init) {
            obj.__init();
          }
        });
      }
      plask.simpleWindow(obj);
    });
  }
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
  require.packages = [
    { name: "plask", location: path + "node", main: "plask" },
    { name: "fs", location: path + "node", main: "fs" }
  ];
  require.ready = function() {
    Pex.require = require;
    if (Pex.readyHandler) {
      Pex.readyHandler();
    }
    if (Pex.runModule) {
      require([Pex.runModule], function() { });
    }

  }

  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = path + "lib/require.js";
  head.appendChild(script);
})();


//var requireJSScript = document.createElement("script");


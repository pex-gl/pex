define(['pex/utils/Log', 'pex/sys/Node'], function(Log, Node) {
  var PlaskIO = (function() {
    function IO() {}
    IO.loadTextFile = function(file, callback) {
      //var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      var data = Node.fs.readFileSync(file, 'utf8');
      if (callback) {
        callback(data);
      }
    }
    return IO;
  });

  var WebIO = (function() {
    function IO() {}
    IO.loadTextFile = function(url, callback) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onreadystatechange = function (e) {
        if (request.readyState == 4) {
          if(request.status == 200) {
             if (callback) {
               callback(request.responseText);
             }
          }
          else {
             Log.error('WebIO.loadTextFile error : ' + request.statusText);
          }
        }
      };
      request.send(null);
    }
    return IO;
  });

  if (typeof window !== 'undefined') {
    return WebIO();
  }
  else {
    return PlaskIO();
  }
});
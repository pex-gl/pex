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

    IO.getWorkingDirectory = function() {
      return '';
    }

    IO.loadImageData = function(gl, texture, target, file, callback) {
      var fullPath = Node.path.resolve(IO.getWorkingDirectory(), file);
      Log.message("IO.loadImageData " + fullPath);
      texture.flipped = true;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(texture.target, texture.handle);
      var canvas = Node.plask.SkCanvas.createFromImage(fullPath);
      gl.texImage2DSkCanvas(target, 0, canvas);
      if (callback) {
        callback(canvas);
      }
    }

    IO.watch = function(file, callback) {
      Node.fs.watch(file, {}, function(event, fileName) {
        if (event == 'change') {
          var data = Node.fs.readFileSync(file, 'utf8');
          if (callback) {
            callback(data);
          }
        }
      });
    }

    IO.saveTextFile = function(file, data) {
      Node.fs.writeFileSync(file, data);
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

    IO.loadImageData = function(gl, texture, target, url, callback) {
      var image = new Image();
      image.onload = function() {
        texture.flipped = true;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(texture.target, texture.handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          target, 0, gl.RGBA, gl.RGBA,
          gl.UNSIGNED_BYTE, image
        );
        if (callback) {
          callback(image);
        }
      }
      image.src = url;
    }

    IO.watch = function() {
      console.log("Warning: WebIO.watch is not implemented!");
    IO.save = function() {
      console.log('Warning: WebIO.save is not implemented!');
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
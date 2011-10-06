define(["plask", "fs", "pex/util/Util"], function(plask, fs, Util) {

  //IO functions when used in plask

  var NodeIO = (function() {
    function IO() {}

    IO.baseDir = "";

    IO.loadTextFile = function(path, callback) {
      var data = fs.readFileSync(path, 'utf8');
      if (callback) {
        callback(data);
      }
    }

    IO.saveTextFile = function(path, data) {
      fs.writeFileSync(path, data);
    }

    IO.loadImageData = function(gl, texture, target, path, callback) {
      Util.log("IO.loadImageData " + path);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(texture.target, texture.handle);
      var canvas = plask.SkCanvas.createFromImage(path);
      gl.texImage2DSkCanvasNoFlip(target, 0, canvas);
      if (callback) {
        callback(canvas);
      }
    }

    return IO;
  })();

  //IO functions when used in the browser

  var WebIO = (function() {
    function IO() {}

    IO.baseDir = "";

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
             Util.log('WebIO.loadTextFile error : ', request.statusText);
          }
        }
      };
      request.send(null);
    }

    IO.loadImageData = function(gl, texture, target, url, callback) {
      var image = new Image();
      image.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(texture.target, texture.handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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

    IO.saveTextFile = function(path, data) {
      throw "IO.saveTextFile not available in Web mode";
    }

    return IO;
  })();

  if (require.nodeRequire) {
    return NodeIO;
  }
  else {
    return WebIO;
  }
});
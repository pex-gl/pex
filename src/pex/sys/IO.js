//Abstraction of file input/output functions to make them transparent between Plask and the browser.

//## Example use
//     function parseData(data) {
//        var lines = data.split("\n");
//        var sum = 0;
//        for(var i=0; i<lines.length; i++) {
//          var line = lines[i];
//          sum += Number(line);
//        }
//        console.log(sum);
//     }
//
//     IO.loadTextFile("data.txt", parseData)

//## Reference
define(["plask", "fs", "path", "pex/util/Log"], function(plask, fs, path, Log) {

  //### NodeIO
  //IO functions when used in node-wegl
  var NodeIO = (function() {

    function IO() {}

    var WebGL = require("node-webgl");

    Image = IO.Image = WebGL.Image;

    //### getWorkingDirectory()
    //Returns base path used for expanding relative path names.
    //In Plask it defaults to the same directory as the main script.
    IO.getWorkingDirectory = function() {
      return require.pexWorkingDirectory;
    }

    //### loadTextFile ( file, callback )
    //Load UTF-8 encoded text data from a file.
    //
    //`file` - path to the file *{ String }*
    //`callback` - function to be called upon successful load taking data as parameter *{ function(String) }*
    IO.loadTextFile = function(file, callback) {
      var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      var data = fs.readFileSync(fullPath, 'utf8');
      if (callback) {
        callback(data);
      }
    }

    //### saveTextFile ( file, data )
    //Load UTF-8 encoded text data from a file.
    //
    //`file` - path to the file *{ String }*
    //`data` - UTF-8 endcoded text data *{ String }*
    IO.saveTextFile = function(file, data) {
      fs.writeFileSync(file, data);
    }

    //### loadImageData ( gl, texture, target, file, callback )
    //Loads binary data and uploads in to texture memory.
    //
    //`gl` - GL context *{ GL }*
    //`texture` - texture object to which upload the pixels *{ Texture2D }*
    //`target` - GL texture target *{ Number/Int }* e.g. *TEXTURE_2D*
    //`file` - path to the file *{ String }*
    //`callback` - function to be called upon successful load taking Plask SkCanvas as a parameter *{ function(SkCanvas) }*
    IO.loadImageData = function(gl, texture, target, file, callback) {
      var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      Log.message("IO.loadImageData " + fullPath);

      var image = new Image();
      image.onload = function() {
        texture.flipped = true;
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
      image.src = fullPath;
    }

    return IO;
  });

  //### PlaskIO
  //IO functions when used in plask
  var PlaskIO = (function() {
    function IO() {}

    //### getWorkingDirectory()
    //Returns base path used for expanding relative path names.
    //In Plask it defaults to the same directory as the main script.
    IO.getWorkingDirectory = function() {
      return require.pexWorkingDirectory;
    }

    //### loadTextFile ( file, callback )
    //Load UTF-8 encoded text data from a file.
    //
    //`file` - path to the file *{ String }*
    //`callback` - function to be called upon successful load taking data as parameter *{ function(String) }*
    IO.loadTextFile = function(file, callback) {
      var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      var data = fs.readFileSync(fullPath, 'utf8');
      if (callback) {
        callback(data);
      }
    }

    //### saveTextFile ( file, data )
    //Load UTF-8 encoded text data from a file.
    //
    //`file` - path to the file *{ String }*
    //`data` - UTF-8 endcoded text data *{ String }*
    IO.saveTextFile = function(file, data) {
      fs.writeFileSync(file, data);
    }

    //### loadImageData ( gl, texture, target, file, callback )
    //Loads binary data and uploads in to texture memory.
    //
    //`gl` - GL context *{ GL }*
    //`texture` - texture object to which upload the pixels *{ Texture2D }*
    //`target` - GL texture target *{ Number/Int }* e.g. *TEXTURE_2D*
    //`file` - path to the file *{ String }*
    //`callback` - function to be called upon successful load taking Plask SkCanvas as a parameter *{ function(SkCanvas) }*
    IO.loadImageData = function(gl, texture, target, file, callback) {
      var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      Log.message("IO.loadImageData " + fullPath);
      texture.flipped = true;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(texture.target, texture.handle);
      var canvas = plask.SkCanvas.createFromImage(fullPath);
      gl.texImage2DSkCanvasNoFlip(target, 0, canvas);
      if (callback) {
        callback(canvas);
      }
    }

    return IO;
  });

  //### WebIO
  //IO functions when used in the browser
  var WebIO = (function() {
    function IO() {}

    //### baseDir
    //Base path used for expanding relative path names.
    //In the browser it defaults to the same url as the current HTML file.
    IO.baseDir = "";

    //### getWorkingDirectory()
    //Returns base path used for expanding relative path names.
    //In the Browser it defaults to the same path as the main html file.
    IO.getWorkingDirectory = function() {
      return "";
    }

    //### loadTextFile ( url, callback )
    //Load UTF-8 encoded text data from an url.
    //
    //`url` - url of resource to load *{ String }*
    //`callback` - function to be called upon successful load
    //*{ function(String) }*
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

    //### saveTextFile ( path, data )
    //Not implemented.
    IO.saveTextFile = function(path, data) {
      throw "IO.saveTextFile not available in Web mode";
    }

    //### loadImageData ( gl, texture, target, url, callback )
    //Loads binary data and uploads in to texture memory.
    //
    //`gl` - GL context *{ GL }*
    //`texture` - texture object to which upload the pixels *{ Texture2D }*
    //`target` - GL texture target *{ Number/Int }* e.g. *TEXTURE_2D*
    //`url` - path to the file *{ String }*
    //`callback` - function to be called upon successful load taking HTML Image as a parameter *{ function(Image) }*
    IO.loadImageData = function(gl, texture, target, url, callback) {
      var image = new Image();
      image.onload = function() {
        texture.flipped = true;
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

    return IO;
  });

  if (plask.SkCanvas) {
    return PlaskIO();
  }
  else if (require.nodeRequire) {
    return NodeIO();
  }
  else {
    return WebIO();
  }
});
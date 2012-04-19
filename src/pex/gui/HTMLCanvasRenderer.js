define(["plask", "pex/core/Context", "pex/core/Texture2D"], function(plask, Context, Texture2D) {
  function HTMLCanvasRenderer(width, height) {
    this.gl = Context.currentContext.gl;
    this.tex = this.gl.createTexture();
    this.tex2 = Texture2D.genNoise();

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
  }
  
  HTMLCanvasRenderer.prototype.draw = function(items) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    var dy;
    var dx;
    var w = 160;
        
    dy = 10;
    
    ctx.font = "10px Monaco";
          
    for(var i=0; i<items.length; i++) {
      var e = items[i];
      var dx = 10;
      var eh = 20;
      
      if (e.type == "slider") eh = 34;
      if (e.type == "button") eh = 24;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
      ctx.fillRect(dx, dy, w, eh - 2);
      
      if (e.type == "slider") {
        ctx.fillStyle = "rgba(150, 150, 150, 1)";
        ctx.fillRect(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
        
        ctx.fillStyle = "rgba(255, 255, 0, 1)";
        ctx.fillRect(dx + 3, dy + 18, (w - 3 - 3)*e.getNormalizedValue(), eh - 5 - 18);    
                        
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
        
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title + " : " + e.getValue(), dx + 5, dy + 13);                
      }
      else if (e.type == "button"){
        ctx.fillStyle = e.active ? "rgba(255, 255, 0, 1)" : "rgba(150, 150, 150, 1)";
        ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3);      

        e.activeArea.set(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3);  
        
        ctx.fillStyle = e.active ? "rgba(100, 100, 100, 1)" : "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title, dx + 5, dy + 15);                
      }
      else if (e.type == "toggle"){
        var on = e.contextObject[e.attributeName];
        
        ctx.fillStyle = on ? "rgba(255, 255, 0, 1)" : "rgba(150, 150, 150, 1)";
        ctx.fillRect(dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3);

        e.activeArea.set(dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3);  
        
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title, dx + 5 + eh - 5, dy + 12);                
      }
      
      else {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title, dx + 5, dy + 13);        
      }
      
      //      else if (e.type == "toggle") {
      //        var on = e.contextObject[e.attributeName];
      //        var toggleColor = on ? this.controlHighlightPaint : this.controlBgPaint;
      //        canvas.drawRect(toggleColor, dx + 3, dy + 3, dx + eh - 5, dy + eh - 5);      
      //        e.activeArea.set(dx + 3, dy + 3, dx + eh - 5, eh - 5);
      //        canvas.drawText(this.fontPaint, items[i].title, dx + 5 + eh - 5, dy + 13);
      //      }
      
      
      
      dy += eh;
    }
    
    this.updateTexture();
  }
  
  HTMLCanvasRenderer.prototype.getTexture = function() {
    return this.tex;
  }
  
  HTMLCanvasRenderer.prototype.updateTexture = function() {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  

  return HTMLCanvasRenderer;
});

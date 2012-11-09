define(["plask", "pex/core/Context", "pex/core/Texture2D"], function(plask, Context, Texture2D) {
  function HTMLCanvasRenderer(width, height) {
    this.gl = Context.currentContext.gl;
    this.canvas = document.createElement("canvas");
    this.tex = Texture2D.create(width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.dirty = true;
  }

  HTMLCanvasRenderer.prototype.draw = function(items) {
    if (!this.dirty) return;
    else this.dirty = false;

    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.font = "10px Monaco";

    var dy = 10;
    var dx = 10;
    var w = 160;
    for(var i=0; i<items.length; i++) {
      var e = items[i];

      if (e.dirty) {
        this.dirty = true;
        e.dirty = false;
      }

      if (e.px && e.px) {
        dx = e.px;
        dy = e.py;
      }
      var eh = 20;

      if (e.type == "slider") eh = 34;
      if (e.type == "button") eh = 24;
      if (e.type == "texture2D") eh = 24 + e.texture.height * w / e.texture.width;
      if (e.type == "radiolist") eh = 18 + e.items.length * 24;

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
      else if (e.type == "radiolist") {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(e.title, dx + 5, dy + 13);
        var itemHeight = 24;
        for(var j=0; j<e.items.length; j++) {
          var item = e.items[j];
          var on = (e.contextObject[e.attributeName] == item.value);
          ctx.fillStyle = on ? "rgba(255, 255, 0, 1)" : "rgba(150, 150, 150, 1)";
          ctx.fillRect(dx + 3, 18 + j*itemHeight + dy + 3, itemHeight - 5 - 3, itemHeight - 5 - 3);
          ctx.fillStyle = "rgba(255, 255, 255, 1)";
          ctx.fillText(item.name, dx + 5 + itemHeight - 5, 18 + j*itemHeight + dy + 13);
        }
        e.activeArea.set(dx + 3, 18 + dy + 3, itemHeight - 5, e.items.length * itemHeight - 5);
      }
      else if (e.type == "texture2D") {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title, dx + 5, dy + 15);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      }
      else {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillText(items[i].title, dx + 5, dy + 13);
      }

      dy += eh;
    }

    this.updateTexture();
  }

  HTMLCanvasRenderer.prototype.getTexture = function() {
    return this.tex;
  }

  HTMLCanvasRenderer.prototype.updateTexture = function() {
    var gl = this.gl;
    this.tex.bind();
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

define([
  'pex/sys/Node',
  'pex/gl/Context',
  'pex/gl/Texture2D'
], function (Node, Context, Texture2D) {
  var plask = Node.plask;
  function SkiaRenderer(width, height) {
    this.gl = Context.currentContext.gl;
    this.tex = Texture2D.create(width, height);
    this.canvas = new plask.SkCanvas.create(width, height);
    this.fontPaint = new plask.SkPaint();
    this.fontPaint.setStyle(plask.SkPaint.kFillStyle);
    this.fontPaint.setColor(255, 255, 255, 255);
    this.fontPaint.setTextSize(10);
    this.fontPaint.setFontFamily('Monaco');
    this.fontPaint.setStrokeWidth(0);
    this.fontHighlightPaint = new plask.SkPaint();
    this.fontHighlightPaint.setStyle(plask.SkPaint.kFillStyle);
    this.fontHighlightPaint.setColor(100, 100, 100, 255);
    this.fontHighlightPaint.setTextSize(10);
    this.fontHighlightPaint.setFontFamily('Monaco');
    this.fontHighlightPaint.setStrokeWidth(0);
    this.panelBgPaint = new plask.SkPaint();
    this.panelBgPaint.setStyle(plask.SkPaint.kFillStyle);
    this.panelBgPaint.setColor(0, 0, 0, 150);
    this.controlBgPaint = new plask.SkPaint();
    this.controlBgPaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlBgPaint.setColor(150, 150, 150, 255);
    this.controlHighlightPaint = new plask.SkPaint();
    this.controlHighlightPaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlHighlightPaint.setColor(255, 255, 0, 255);
    this.controlFeaturePaint = new plask.SkPaint();
    this.controlFeaturePaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlFeaturePaint.setColor(255, 255, 255, 255);
  }
  SkiaRenderer.prototype.isAnyItemDirty = function (items) {
    var dirty = false;
    items.forEach(function (item) {
      if (item.dirty) {
        item.dirty = false;
        dirty = true;
      }
    });
    return dirty;
  };
  SkiaRenderer.prototype.draw = function (items, scale) {
    if (!this.isAnyItemDirty(items)) {
      return;
    }
    var canvas = this.canvas;
    canvas.drawColor(0, 0, 0, 0, plask.SkPaint.kClearMode);
    //transparent
    var dy = 10;
    var dx = 10;
    var w = 160;
    for (var i = 0; i < items.length; i++) {
      var e = items[i];
      if (e.px && e.px) {
        dx = e.px;
        dy = e.py;
      }
      var eh = 20 * scale;
      if (e.type == 'slider')
        eh = 20 * scale + 14;
      if (e.type == 'multislider')
        eh = 18 + e.getValue().length * 20 * scale;
      if (e.type == 'button')
        eh = 24 * scale;
      if (e.type == 'texture2D')
        eh = 24 + e.texture.height * w / e.texture.width;
      if (e.type == 'radiolist')
        eh = 18 + e.items.length * 20 * scale;
      canvas.drawRect(this.panelBgPaint, dx, dy, dx + w, dy + eh - 2);
      if (e.type == 'slider') {
        var value = e.getValue();
        canvas.drawRect(this.controlBgPaint, dx + 3, dy + 18, dx + w - 3, dy + eh - 5);
        canvas.drawRect(this.controlHighlightPaint, dx + 3, dy + 18, dx + 3 + (w - 6) * e.getNormalizedValue(), dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
        canvas.drawText(this.fontPaint, items[i].title + ' : ' + e.getStrValue(), dx + 3, dy + 13);
      } else if (e.type == 'multislider') {
        for (var j = 0; j < e.getValue().length; j++) {
          canvas.drawRect(this.controlBgPaint, dx + 3, dy + 18 + j * 20 * scale, dx + w - 3, dy + 18 + (j + 1) * 20 * scale - 6);
          canvas.drawRect(this.controlHighlightPaint, dx + 3, dy + 18 + j * 20 * scale, dx + 3 + (w - 6) * e.getNormalizedValue(j), dy + 18 + (j + 1) * 20 * scale - 6);
        }
        canvas.drawText(this.fontPaint, items[i].title + ' : ' + e.getStrValue(), dx + 3, dy + 13);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      } else if (e.type == 'button') {
        var btnColor = e.active ? this.controlHighlightPaint : this.controlBgPaint;
        var btnFont = e.active ? this.fontHighlightPaint : this.fontPaint;
        canvas.drawRect(btnColor, dx + 3, dy + 3, dx + w - 3, dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 3, w - 3 - 3, eh - 5);
        if (e.options.color) {
          var c = e.options.color;
          this.controlFeaturePaint.setColor(255 * c.x, 255 * c.y, 255 * c.z, 255);
          canvas.drawRect(this.controlFeaturePaint, dx + w - 8, dy + 3, dx + w - 3, dy + eh - 5);
        }
        canvas.drawText(btnFont, items[i].title, dx + 5, dy + 15);
      } else if (e.type == 'toggle') {
        var on = e.contextObject[e.attributeName];
        var toggleColor = on ? this.controlHighlightPaint : this.controlBgPaint;
        canvas.drawRect(toggleColor, dx + 3, dy + 3, dx + eh - 5, dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 3, eh - 5, eh - 5);
        canvas.drawText(this.fontPaint, items[i].title, dx + 5 + eh - 5, dy + 13);
      } else if (e.type == 'radiolist') {
        canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13);
        var itemColor = this.controlBgPaint;
        var itemHeight = 20 * scale;
        for (var j = 0; j < e.items.length; j++) {
          var item = e.items[j];
          var on = e.contextObject[e.attributeName] == item.value;
          var itemColor = on ? this.controlHighlightPaint : this.controlBgPaint;
          canvas.drawRect(itemColor, dx + 3, 18 + j * itemHeight + dy + 3, dx + itemHeight - 5, itemHeight + j * itemHeight + dy + 18 - 5);
          canvas.drawText(this.fontPaint, item.name, dx + 5 + itemHeight - 5, 18 + j * itemHeight + dy + 13);
        }
        e.activeArea.set(dx + 3, 18 + dy + 3, itemHeight - 5, e.items.length * itemHeight - 5);
      } else if (e.type == 'texture2D') {
        canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      } else {
        canvas.drawText(this.fontPaint, items[i].title, dx + 3, dy + 13);
      }
      dy += eh;
    }
    this.updateTexture();
  };
  SkiaRenderer.prototype.getTexture = function () {
    return this.tex;
  };
  SkiaRenderer.prototype.updateTexture = function () {
    var gl = this.gl;
    this.tex.bind();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, this.canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  return SkiaRenderer;
});
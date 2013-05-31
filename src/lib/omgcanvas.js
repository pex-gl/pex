// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/omgcanvas
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var plask = require('plask');
var parseCSSColor = require('./csscolorparser.js').parseCSSColor;

// NOTE(deanm): Although in Chrome for DOM styles it seems to return a string
// of the form rgb() or rgba() always, for <canvas> it seems to return #123123
// syntax except for when there is a non opaque alpha.
function colorToCSSColorString(c) {
  if (c[3] === 1)
    return '#' + (1<<24 | c[0]<<16 | c[1]<<8 | c[2]).toString(16).substr(1);
  // TODO(deanm): Should we limit the alpha's precision (toPrecision()) ?
  return 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + c[3] + ')';
}

function CanvasContext(skcanvas) {
  // Each CanvasRenderingContext2D rendering context maintains a stack of
  // drawing states. Drawing states consist of:
  //
  // - The current transformation matrix.
  // - The current clipping region.
  // - The current values of the following attributes: strokeStyle, fillStyle,
  //   globalAlpha, lineWidth, lineCap, lineJoin, miterLimit, lineDashOffset,
  //   shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor,
  //   globalCompositeOperation, font, textAlign, textBaseline, direction,
  //   imageSmoothingEnabled.
  // - The current dash list.

  var upaint = new plask.SkPaint();  // Utility paint for internal use.

  var paint = new plask.SkPaint();  // Track top paint element of state_stack.
  paint.setAntiAlias(true);
  paint.setStrokeWidth(1);  // Skia defaults to 0?
  paint.setStrokeMiter(10);  // Skia defaults to 4.

  var state_stack = [{paint: paint,
                      lineWidth: 1,
                      lineCap: 'butt',
                      lineJoin: 'miter',
                      miterLimit: 10,
                      lineDash: [ ],
                      lineDashOffset: 0,
                      strokeColor: [0, 0, 0, 1],
                      strokeStyle: colorToCSSColorString([0, 0, 0, 1]),
                      fillColor: [0, 0, 0, 1],
                      fillStyle: colorToCSSColorString([0, 0, 0, 1])}];
  var state = state_stack[0];  // Track top element of state_stack.

  var path = new plask.SkPath;

  return {
    canvas: skcanvas,  // Back pointer, hopefully enough for width/height/etc.

    // void save();
    save: function() {
      paint = new plask.SkPaint(paint);  // Dup top.
      state = {paint: paint,
               lineWidth: state.lineWidth,
               lineCap: state.lineCap,
               lineJoin: state.lineJoin,
               miterLimit: state.miterLimit,
               lineDash: state.lineDash,  // Read only, no dup().
               lineDashOffset: state.lineDashOffset,
               strokeColor: state.strokeColor,  // Read only, no dup().
               strokeStyle: state.strokeStyle,
               fillColor: state.fillColor,      // Read only, no dup().
               fillStyle: state.fillStyle};
      state_stack.push(state);
      skcanvas.save();  // Matrix and clip.
    },

    // void restore();
    restore: function() {
      if (state_stack.length > 1) {
        state_stack.pop();
        state = state_stack[state_stack.length - 1];
        paint = state.paint;
        skcanvas.restore();  // Matrix and clip.
      }
    },

    // [Custom] attribute custom strokeStyle;
    get strokeStyle() { return state.strokeStyle; },
    set strokeStyle(v) {
      var c = parseCSSColor(v);
      if (c !== null) {
        state.strokeColor = c;
        // Seems to be what browers do for css style properties.
        state.strokeStyle = colorToCSSColorString(c);
      }
    },

    // [Custom] attribute custom fillStyle;
    get fillStyle() { return state.fillStyle; },
    set fillStyle(v) {
      var c = parseCSSColor(v);
      if (c !== null) {
        state.fillColor = c;
        // Seems to be what browers do for css style properties.
        state.fillStyle = colorToCSSColorString(c);
      }
    },

    // attribute float lineWidth;
    get lineWidth() { return state.lineWidth; },
    set lineWidth(v) {
      if ((typeof v) === 'string') v = parseFloat(v);

      // NOTE(deanm): From the spec:
      //   On setting, zero, negative, infinite, and NaN values must be ignored
      if (v > 0 && isFinite(v)) {
        state.lineWidth = v;
        paint.setStrokeWidth(v);
      }
    },

    // [TreatNullAs=NullString] attribute DOMString lineCap;
    // NOTE(deanm): Spec defaults to "butt".
    get lineCap() { return state.lineCap; },
    set lineCap(v) {
      var cap = null;

      // TODO(deanm): Case insensitive or any trimming?
      switch (v) {
        case 'butt': cap = paint.kButtCap; break;
        case 'round': cap = paint.kRoundCap; break;
        case 'square': cap = paint.kSquareCap; break;
        default: return;
      }

      state.lineCap = v;
      paint.setStrokeCap(cap);
    },

    // [TreatNullAs=NullString] attribute DOMString lineJoin;
    // NOTE(deanm): Spec defaults to "miter".
    get lineJoin() { return state.lineJoin; },
    set lineJoin(v) {
      var join = null;

      // TODO(deanm): Case insensitive or any trimming?
      switch (v) {
        case 'round': join = paint.kRoundJoin; break;
        case 'bevel': join = paint.kBevelJoin; break;
        case 'miter': join = paint.kMiterJoin; break;
        default: return;
      }

      state.lineJoin = v;
      paint.setStrokeJoin(join);
    },

    // attribute float miterLimit;
    get miterLimit() { return state.miterLimit; },
    set miterLimit(v) {
      // NOTE(deanm): From the spec:
      //   On setting, zero, negative, infinite, and NaN values must be ignored
      if (v > 0 && isFinite(v)) {
        state.miterLimit = v;
        paint.setStrokeMiter(v);
      }
    },

    // void setLineDash(in sequence<float> dash);
    // NOTE(deanm): From the spec:
    //   Each CanvasDrawingStyles object has a dash list, which is either empty
    //   or consists of an even number of non-negative numbers. Initially, the
    //   dash list must be empty.
    //
    //   When the setLineDash() method is invoked, it must run the following
    //   steps:
    //
    //   Let a be the argument.
    //
    //   If any value in a is not finite (e.g. an Infinity or a NaN value), or
    //   if any value is negative (less than zero), then abort these steps
    //   (without throwing an exception; user agents could show a message on a
    //   developer console, though, as that would be helpful for debugging).
    //
    //   If the number of elements in a is odd, then let a be the
    //   concatentation of two copies of a.
    //
    //   Let the object's dash list be a.
    setLineDash: function(arr) {
      // Chrome will ignore most invalid arguments, but not no argument.
      if (arguments.length === 0) throw new TypeError('Not enough arguments');

      // Chrome seems to clear the dash list on a non-array argument.
      if (!Array.isArray(arr)) arr = [ ];

      for (var i = 0, il = arr.length; i < il; ++i) {
        if (arr[i] < 0 || !isFinite(arr[i])) return;
      }

      if (arr.length & 1) arr = arr.concat(arr);

      state.lineDash = arr;

      // TODO(deanm): Can we optimize to call setDashPathEffect less?
      if (arr.length === 0) {
        paint.clearPathEffect();
      } else {
        paint.setDashPathEffect(state.lineDash, state.lineDashOffset);
      }
    },

    // sequence<float> getLineDash();
    getLineDash: function() {
      return state.lineDash.slice();  // dup.
    },

    // attribute float lineDashOffset;
    get lineDashOffset() { return state.lineDashOffset; },
    set lineDashOffset(v) {
      if ((typeof v) === 'string') v = parseFloat(v);

      // NOTE(deanm): From the spec:
      //   On setting, infinite and NaN values must be ignored
      if (isFinite(v)) {
        state.lineDashOffset = v;
        // TODO(deanm): Can we optimize to call setDashPathEffect less?
        if (state.lineDash.length === 0) {
          paint.clearPathEffect();
        } else {
          paint.setDashPathEffect(state.lineDash, state.lineDashOffset);
        }
      }
    },

    // void setLineWidth(in [Optional=DefaultIsUndefined] float width);
    setLineWidth: function(v) { this.lineWidth = v; },
    // void setLineCap(in [Optional=DefaultIsUndefined] DOMString cap);
    setLineCap: function(v) { this.lineCap = v; },
    // void setLineJoin(in [Optional=DefaultIsUndefined] DOMString join);
    setLineJoin: function(v) { this.lineJoin = v; },
    // void setMiterLimit(in [Optional=DefaultIsUndefined] float limit);
    setMiterLimit: function(v) { this.miterLimit = v; },

    // void clearRect(in [Optional=DefaultIsUndefined] float x,
    //                in [Optional=DefaultIsUndefined] float y,
    //                in [Optional=DefaultIsUndefined] float width,
    //                in [Optional=DefaultIsUndefined] float height);
    clearRect: function(x, y, w, h) {
      upaint.setXfermodeMode(upaint.kClearMode);
      skcanvas.drawRect(upaint, x, y, x+w, y+h);
    },

    // void fillRect(in [Optional=DefaultIsUndefined] float x,
    //               in [Optional=DefaultIsUndefined] float y,
    //               in [Optional=DefaultIsUndefined] float width,
    //               in [Optional=DefaultIsUndefined] float height);
    fillRect: function(x, y, w, h) {
      // TODO(deanm): Avoid the save/restore.
      this.save();
      paint.setFill();
      var c = state.fillColor;
      paint.setColor(c[0], c[1], c[2], (c[3] * 255) >> 0);
      skcanvas.drawRect(paint, x, y, x+w, y+h);
      this.restore();
    },

    // void strokeRect(in [Optional=DefaultIsUndefined] float x,
    //                 in [Optional=DefaultIsUndefined] float y,
    //                 in [Optional=DefaultIsUndefined] float width,
    //                 in [Optional=DefaultIsUndefined] float height,
    //                 in [Optional] float lineWidth);
    // NOTE(deanm): I don't see lineWidth in the current spec.
    strokeRect: function(x, y, w, h) {
      // TODO(deanm): Avoid the save/restore.
      this.save();
      paint.setStroke();
      var c = state.strokeColor;
      paint.setColor(c[0], c[1], c[2], (c[3] * 255) >> 0);
      skcanvas.drawRect(paint, x, y, x+w, y+h);
      this.restore();
    },

    // void beginPath();
    beginPath: function() {
      path.rewind();  // TODO(deanm): reset vs rewind.
    },

    // void closePath();
    closePath: function() {
      path.close();
    },

    // void moveTo(in [Optional=DefaultIsUndefined] float x,
    //             in [Optional=DefaultIsUndefined] float y);
    moveTo: function(x, y) {
      path.moveTo(x, y);
    },

    // void lineTo(in [Optional=DefaultIsUndefined] float x,
    //             in [Optional=DefaultIsUndefined] float y);
    lineTo: function(x, y) {
      path.lineTo(x, y);
    },

    // void rect(in [Optional=DefaultIsUndefined] float x,
    //           in [Optional=DefaultIsUndefined] float y,
    //           in [Optional=DefaultIsUndefined] float width,
    //           in [Optional=DefaultIsUndefined] float height);
    rect: function(x, y, w, h) {
      path.addRect(x, y, x+w, y+h);
    },

    // void arcTo(in [Optional=DefaultIsUndefined] float x1,
    //            in [Optional=DefaultIsUndefined] float y1,
    //            in [Optional=DefaultIsUndefined] float x2,
    //            in [Optional=DefaultIsUndefined] float y2,
    //            in [Optional=DefaultIsUndefined] float radius)
    //     raises (DOMException);
    arcTo: function(x1, y1, x2, y2, radius) {
      path.arct(x1, y1, x2, y2, radius);
    },

    // void arc(in [Optional=DefaultIsUndefined] float x,
    //          in [Optional=DefaultIsUndefined] float y,
    //          in [Optional=DefaultIsUndefined] float radius,
    //          in [Optional=DefaultIsUndefined] float startAngle,
    //          in [Optional=DefaultIsUndefined] float endAngle,
    //          in [Optional=DefaultIsUndefined] boolean anticlockwise)
    //     raises (DOMException);
    arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
      var sweep = endAngle - startAngle;
      var start_deg = startAngle * 180 / plask.kPI;
      var sweep_deg = sweep * 180 / plask.kPI;

      // See Path::addArc in
      // http://trac.webkit.org/browser/trunk/Source/WebCore/platform/graphics/skia/PathSkia.cpp
      if (sweep_deg >= 360 || sweep_deg <= -360) {  // Circle.
        path.arcTo(x-radius, y-radius, x+radius, y+radius, start_deg, 0);
        path.addOval(x-radius, y-radius, x+radius, y+radius, anticlockwise);
        path.arcTo(x-radius, y-radius, x+radius, y+radius,
                   start_deg+sweep_deg, 0, true);
      } else {
        if (anticlockwise && sweep_deg > 0) sweep_deg -= 360;
        if (!anticlockwise && sweep_deg < 0) sweep_deg += 360;
        path.arcTo(x-radius, y-radius, x+radius, y+radius,
                   start_deg, sweep_deg);
      }
    },

    // void quadraticCurveTo(in [Optional=DefaultIsUndefined] float cpx,
    //                       in [Optional=DefaultIsUndefined] float cpy,
    //                       in [Optional=DefaultIsUndefined] float x,
    //                       in [Optional=DefaultIsUndefined] float y);
    quadraticCurveTo: function(cpx, cpy, x, y) {
      path.quadTo(cpx, cpy, x, y);
    },

    // void bezierCurveTo(in [Optional=DefaultIsUndefined] float cp1x,
    //                    in [Optional=DefaultIsUndefined] float cp1y,
    //                    in [Optional=DefaultIsUndefined] float cp2x,
    //                    in [Optional=DefaultIsUndefined] float cp2y,
    //                    in [Optional=DefaultIsUndefined] float x,
    //                    in [Optional=DefaultIsUndefined] float y);
    bezierCurveTo: function(cpx1, cp1y, cp2x, cp2y, x, y) {
      path.cubicTo(cpx1, cp1y, cp2x, cp2y, x, y);
    },

    // void fill();
    fill: function() {
      // TODO(deanm): Avoid the save/restore.
      this.save();
      paint.setFill();
      var c = state.fillColor;
      paint.setColor(c[0], c[1], c[2], (c[3] * 255) >> 0);
      skcanvas.drawPath(paint, path);
      this.restore();
    },

    // void stroke();
    stroke: function() {
      // TODO(deanm): Avoid the save/restore.
      this.save();
      paint.setStroke();
      var c = state.strokeColor;
      paint.setColor(c[0], c[1], c[2], (c[3] * 255) >> 0);
      skcanvas.drawPath(paint, path);
      this.restore();
    },

    // void clip();
    clip: function() {
      skcanvas.clipPath(path);
    },

    // void scale(in [Optional=DefaultIsUndefined] float sx,
    //            in [Optional=DefaultIsUndefined] float sy);
    scale: function(sx, sy) {
      skcanvas.scale(sx, sy);
    },

    // void rotate(in [Optional=DefaultIsUndefined] float angle);
    rotate: function(angle) {
      skcanvas.rotate(angle * 180 / plask.kPI);
    },

    // void translate(in [Optional=DefaultIsUndefined] float tx,
    //                in [Optional=DefaultIsUndefined] float ty);
    translate: function(tx, ty) {
      skcanvas.translate(tx, ty);
    },

    // void transform(in [Optional=DefaultIsUndefined] float m11,
    //                in [Optional=DefaultIsUndefined] float m12,
    //                in [Optional=DefaultIsUndefined] float m21,
    //                in [Optional=DefaultIsUndefined] float m22,
    //                in [Optional=DefaultIsUndefined] float dx,
    //                in [Optional=DefaultIsUndefined] float dy);
    transform: function(m11, m12, m21, m22, dx, dy) {
      skcanvas.concatMatrix(m11, m21, dx,
                            m12, m22, dy,
                              0,   0,  1);
    },
    // void setTransform(in [Optional=DefaultIsUndefined] float m11,
    //                   in [Optional=DefaultIsUndefined] float m12,
    //                   in [Optional=DefaultIsUndefined] float m21,
    //                   in [Optional=DefaultIsUndefined] float m22,
    //                   in [Optional=DefaultIsUndefined] float dx,
    //                   in [Optional=DefaultIsUndefined] float dy);
    setTransform: function(m11, m12, m21, m22, dx, dy) {
      skcanvas.setMatrix(m11, m21, dx,
                         m12, m22, dy,
                           0,   0,  1);
    },

    // NOTE(deanm): The pixel access is not going to be a particularly great
    // implementation.  But actually even what the browsers do isn't very good,
    // which is why Plask's canvas works different (and BGRA ordering).

    // ImageData createImageData(in ImageData? imagedata)
    //     raises (DOMException);
    // ImageData createImageData(in float sw, in float sh)
    //     raises (DOMException);
    createImageData: function(sw, sh) {
      if (arguments.length === 1) {
        sh = sw.height; sw = sw.width;
      }

      // TODO(deanm): Switch to Uint8ClampedArray.
      var data = new Uint8Array(sw * sh * 4);

      // TODO(deanm): Hopefully there doesn't need to be an ImageData type.
      return {width: sw, height: sh, data: data};
    },

    // ImageData getImageData(in [Optional=DefaultIsUndefined] float sx,
    //                        in [Optional=DefaultIsUndefined] float sy,
    //                        in [Optional=DefaultIsUndefined] float sw,
    //                        in [Optional=DefaultIsUndefined] float sh)
    //     raises(DOMException);
    getImageData: function(sx, sy, sw, sh) {
      var w = skcanvas.width, h = skcanvas.height;
      var id = this.createImageData(sw, sh);
      var data = id.data;
      for (var dy = 0; dy < sh; ++dy) {  // Copy and swizzle.
        var dsl = (dy * sw) << 2;
        var csl = ((sy + dy) * w + sx) << 2;
        for (var dx = 0; dx < sw; ++dx) {
          var b = skcanvas[csl++], g = skcanvas[csl++], r = skcanvas[csl++]
              a = skcanvas[csl++];
          var unpremultiply = a === 0 ? 0 : 255/a;  // Have to unpremultiply.
          data[dsl++] = (r * unpremultiply) >> 0;
          data[dsl++] = (g * unpremultiply) >> 0;
          data[dsl++] = (b * unpremultiply) >> 0;
          data[dsl++] = a;
        }
      }

      return id;
    },

    // void putImageData(in ImageData? imagedata, in float dx, in float dy)
    //     raises(DOMException);
    // void putImageData(in ImageData? imagedata, in float dx, in float dy,
    //                   in float dirtyX, in float dirtyY,
    //                   in float dirtyWidth, in float dirtyHeight)
    //     raises(DOMException);
    putImageData: function(imagedata, sx, sy) {
      // TODO(deanm): Support dirty, although it is only an optimization.
      var w = skcanvas.width, h = skcanvas.height;
      var sw = imagedata.width, sh = imagedata.height;
      var data = imagedata.data;
      for (var dy = 0; dy < sh; ++dy) {  // Copy and swizzle.
        var dsl = (dy * sw) << 2;
        var csl = ((sy + dy) * w + sx) << 2;
        for (var dx = 0; dx < sw; ++dx) {
          var r = data[dsl++], g = data[dsl++]; b = data[dsl++],
              a = data[dsl++];
          var fa = a / 255;  // Have to premultiply.
          skcanvas[csl++] = (b * fa) >> 0;
          skcanvas[csl++] = (g * fa) >> 0;
          skcanvas[csl++] = (r * fa) >> 0;
          skcanvas[csl++] = a;
        }
      }
    },
  };
}

exports.CanvasContext = CanvasContext;

// TODO(deanm): These are the parts of the interface unfinished.

// 
// attribute float globalAlpha;
// [TreatNullAs=NullString] attribute DOMString globalCompositeOperation;
// 
// CanvasGradient createLinearGradient(in [Optional=DefaultIsUndefined] float x0,
//                                     in [Optional=DefaultIsUndefined] float y0,
//                                     in [Optional=DefaultIsUndefined] float x1,
//                                     in [Optional=DefaultIsUndefined] float y1)
//     raises (DOMException);
// CanvasGradient createRadialGradient(in [Optional=DefaultIsUndefined] float x0,
//                                     in [Optional=DefaultIsUndefined] float y0,
//                                     in [Optional=DefaultIsUndefined] float r0,
//                                     in [Optional=DefaultIsUndefined] float x1,
//                                     in [Optional=DefaultIsUndefined] float y1,
//                                     in [Optional=DefaultIsUndefined] float r1)
//     raises (DOMException);
// 
// 
// attribute float shadowOffsetX;
// attribute float shadowOffsetY;
// attribute float shadowBlur;
// [TreatNullAs=NullString] attribute DOMString shadowColor;
//
// // FIXME: These attributes should also be implemented for V8.
// #if !(defined(V8_BINDING) && V8_BINDING)
// [Custom] attribute Array webkitLineDash;
// attribute float webkitLineDashOffset;
// #endif
// 
// 
// boolean isPointInPath(in [Optional=DefaultIsUndefined] float x,
//                       in [Optional=DefaultIsUndefined] float y);
// 
// // text
// attribute DOMString font;
// attribute DOMString textAlign;
// attribute DOMString textBaseline;
// 
// TextMetrics measureText(in [Optional=DefaultIsUndefined] DOMString text);
// 
// // other
// 
// void setAlpha(in [Optional=DefaultIsUndefined] float alpha);
// void setCompositeOperation(in [Optional=DefaultIsUndefined] DOMString compositeOperation);
// 
// void clearShadow();
// 
// void fillText(in DOMString text, in float x, in float y, in [Optional] float maxWidth);
// void strokeText(in DOMString text, in float x, in float y, in [Optional] float maxWidth);
// 
// void setStrokeColor(in [StrictTypeChecking] DOMString color, in [Optional] float alpha);
// void setStrokeColor(in float grayLevel, in [Optional] float alpha);
// void setStrokeColor(in float r, in float g, in float b, in float a);
// void setStrokeColor(in float c, in float m, in float y, in float k, in float a);
// 
// void setFillColor(in [StrictTypeChecking] DOMString color, in [Optional] float alpha);
// void setFillColor(in float grayLevel, in [Optional] float alpha);
// void setFillColor(in float r, in float g, in float b, in float a);
// void setFillColor(in float c, in float m, in float y, in float k, in float a);
// 
// void drawImage(in HTMLImageElement? image, in float x, in float y)
//     raises (DOMException);
// void drawImage(in HTMLImageElement? image, in float x, in float y, in float width, in float height)
//     raises (DOMException);
// void drawImage(in HTMLImageElement? image, in float sx, in float sy, in float sw, in float sh, in float dx, in float dy, in float dw, in float dh)
//     raises (DOMException);
// void drawImage(in HTMLCanvasElement? canvas, in float x, in float y)
//     raises (DOMException);
// void drawImage(in HTMLCanvasElement? canvas, in float x, in float y, in float width, in float height)
//     raises (DOMException);
// void drawImage(in HTMLCanvasElement? canvas, in float sx, in float sy, in float sw, in float sh, in float dx, in float dy, in float dw, in float dh)
//     raises (DOMException);
// #if defined(ENABLE_VIDEO) && ENABLE_VIDEO
// void drawImage(in HTMLVideoElement? video, in float x, in float y)
//     raises (DOMException);
// void drawImage(in HTMLVideoElement? video, in float x, in float y, in float width, in float height)
//     raises (DOMException);
// void drawImage(in HTMLVideoElement? video, in float sx, in float sy, in float sw, in float sh, in float dx, in float dy, in float dw, in float dh)
//     raises (DOMException);
// #endif
// 
// void drawImageFromRect(in HTMLImageElement image,
//                        in [Optional] float sx, in [Optional] float sy, in [Optional] float sw, in [Optional] float sh,
//                        in [Optional] float dx, in [Optional] float dy, in [Optional] float dw, in [Optional] float dh,
//                        in [Optional] DOMString compositeOperation);
// 
// void setShadow(in float width, in float height, in float blur, in [Optional, StrictTypeChecking] DOMString color, in [Optional] float alpha);
// void setShadow(in float width, in float height, in float blur, in float grayLevel, in [Optional] float alpha);
// void setShadow(in float width, in float height, in float blur, in float r, in float g, in float b, in float a);
// void setShadow(in float width, in float height, in float blur, in float c, in float m, in float y, in float k, in float a);
// 
// void webkitPutImageDataHD(in ImageData? imagedata, in float dx, in float dy)
//     raises(DOMException);
// void webkitPutImageDataHD(in ImageData? imagedata, in float dx, in float dy, in float dirtyX, in float dirtyY, in float dirtyWidth, in float dirtyHeight)
//     raises(DOMException);
// 
// CanvasPattern createPattern(in HTMLCanvasElement? canvas, in [TreatNullAs=NullString] DOMString repetitionType)
//     raises (DOMException);
// CanvasPattern createPattern(in HTMLImageElement? image, in [TreatNullAs=NullString] DOMString repetitionType)
//     raises (DOMException);

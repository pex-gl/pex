(function() {
  define(function(require) {
    var Buffer, Context, Geometry, indexTypes;
    Geometry = require('pex/geom/Geometry');
    Context = require('pex/gl/Context');
    Buffer = require('pex/gl/Buffer');
    indexTypes = ['faces', 'edges', 'indices'];
    Geometry.prototype.compile = function() {
      var attrib, attribName, indexName, usage, _i, _len, _ref, _results;
      if (this.gl == null) {
        this.gl = Context.currentContext.gl;
      }
      _ref = this.attribs;
      for (attribName in _ref) {
        attrib = _ref[attribName];
        if (!attrib.buffer) {
          usage = attrib.dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
          attrib.buffer = new Buffer(this.gl.ARRAY_BUFFER, Float32Array, null, usage);
          attrib.dirty = true;
        }
        if (attrib.dirty) {
          attrib.buffer.update(attrib);
          attrib.dirty = false;
        }
      }
      _results = [];
      for (_i = 0, _len = indexTypes.length; _i < _len; _i++) {
        indexName = indexTypes[_i];
        if (this[indexName]) {
          if (!this[indexName].buffer) {
            usage = this[indexName].dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
            this[indexName].buffer = new Buffer(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array, null, usage);
            this[indexName].dirty = true;
          }
          if (this[indexName].dirty) {
            this[indexName].buffer.update(this[indexName]);
            _results.push(this[indexName].dirty = false);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return Geometry.prototype.dispose = function() {
      var attrib, attribName, indexName, _i, _len, _ref, _results;
      _ref = this.attribs;
      for (attribName in _ref) {
        attrib = _ref[attribName];
        if (attrib && attrib.buffer) {
          attrib.buffer.dispose();
        }
      }
      _results = [];
      for (_i = 0, _len = indexTypes.length; _i < _len; _i++) {
        indexName = indexTypes[_i];
        if (this[indexName] && this[indexName].buffer) {
          _results.push(this[indexName].buffer.dispose());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
  });

}).call(this);

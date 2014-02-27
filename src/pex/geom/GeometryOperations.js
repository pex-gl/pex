(function() {
  define(function(require) {
    var Edge, Face3, Face4, Geometry;
    Face3 = require('pex/geom/Face3');
    Face4 = require('pex/geom/Face4');
    Edge = require('pex/geom/Edge');
    Geometry = require('pex/geom/Geometry');
    Geometry.prototype.translate = function(v) {
      this.vertices.forEach(function(vert) {
        return vert.add(v);
      });
      return this;
    };
    Geometry.prototype.scale = function(s) {
      this.vertices.forEach(function(vert) {
        return vert.scale(s);
      });
      return this;
    };
    Geometry.prototype.rotate = function(q) {
      this.vertices.forEach(function(vert) {
        return vert.transformQuat(q);
      });
      return this;
    };
    Geometry.merge = function(a, b) {
      var color, colors, edge, edges, face, faces, geom, normal, normals, texCoord, texCoords, vertexOffset, vertices, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      vertices = a.vertices.concat(b.vertices).map(function(v) {
        return v.dup();
      });
      geom = new Geometry({
        vertices: vertices
      });
      vertexOffset = a.vertices.length;
      if (a.faces && b.faces) {
        faces = [];
        _ref = a.faces;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          face = _ref[_i];
          if (face instanceof Face3) {
            faces.push(new Face3(face.a, face.b, face.c));
          }
          if (face instanceof Face4) {
            faces.push(new Face4(face.a, face.b, face.c, face.d));
          }
        }
        _ref1 = b.faces;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          face = _ref1[_j];
          if (face instanceof Face3) {
            faces.push(new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset));
          }
          if (face instanceof Face4) {
            faces.push(new Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset));
          }
        }
        geom.faces = faces;
      }
      if (a.edges && b.edges) {
        edges = [];
        _ref2 = a.edges;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          edge = _ref2[_k];
          edges.push(new Edge(edge.a, edge.b));
        }
        _ref3 = b.edges;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          edge = _ref3[_l];
          edges.push(new Edge(edge.a + vertexOffset, edge.b + vertexOffset));
        }
        geom.edges = edges;
      }
      if (a.normals && b.normals) {
        normals = [];
        _ref4 = a.normals;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          normal = _ref4[_m];
          normals.push(normal.dup());
        }
        _ref5 = b.normals;
        for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
          normal = _ref5[_n];
          normals.push(normal.dup());
        }
        geom.addAttrib('normals', 'normal', normals);
      }
      if (a.texCoords && b.texCoords) {
        texCoords = [];
        _ref6 = a.texCoords;
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          texCoord = _ref6[_o];
          texCoords.push(texCoord.dup());
        }
        _ref7 = b.texCoords;
        for (_p = 0, _len7 = _ref7.length; _p < _len7; _p++) {
          texCoord = _ref7[_p];
          texCoords.push(texCoord.dup());
        }
        geom.addAttrib('texCoords', 'texCoord', texCoords);
      }
      if (a.colors && b.colors) {
        colors = [];
        _ref8 = a.colors;
        for (_q = 0, _len8 = _ref8.length; _q < _len8; _q++) {
          color = _ref8[_q];
          colors.push(color.dup());
        }
        _ref9 = b.colors;
        for (_r = 0, _len9 = _ref9.length; _r < _len9; _r++) {
          color = _ref9[_r];
          colors.push(color.dup());
        }
        geom.addAttrib('colors', 'color', colors);
      }
      return geom;
    };
    return Geometry;
  });

}).call(this);

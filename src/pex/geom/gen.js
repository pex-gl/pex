(function() {
  define(function(require) {
    var exports;
    return exports = {
      Cube: require('pex/geom/gen/Cube'),
      Sphere: require('pex/geom/gen/Sphere'),
      LineBuilder: require('pex/geom/gen/LineBuilder'),
      Tetrahedron: require('pex/geom/gen/Tetrahedron'),
      Icosahedron: require('pex/geom/gen/Icosahedron'),
      Octahedron: require('pex/geom/gen/Octahedron'),
      Dodecahedron: require('pex/geom/gen/Dodecahedron'),
      HexSphere: require('pex/geom/gen/HexSphere'),
      Plane: require('pex/geom/gen/Plane')
    };
  });

}).call(this);

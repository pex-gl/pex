define(
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude'
  ],
  function(HEMesh, HEGeometryConverter, HEExtrude) {
    return function() {
      return new HEMesh();
    }
  }
);

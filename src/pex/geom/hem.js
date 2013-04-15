define(
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HESelection',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude'
  ],
  function(HEMesh, HESelection, HEGeometryConverter, HEExtrude) {
    return function() {
      return new HEMesh();
    }
  }
);

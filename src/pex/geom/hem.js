define(
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HEGeometryConverter'
  ],
  function(HEMesh, HEGeometryConverter) {
    return function() {
      return new HEMesh();
    }
  }
);

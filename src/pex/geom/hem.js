define(
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HESelection',
    'pex/geom/hem/HEMarking',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude',
    'pex/geom/hem/HECatmullClark',
    'pex/geom/hem/HETriangulate',
    'pex/geom/hem/HESubdivideTriangles'
  ],
  function(HEMesh, HESelection, HEMarking, HEGeometryConverter, HEExtrude, HECatmullClark, HETriangulate, HESubdivideTriangles) {
    return function() {
      return new HEMesh();
    }
  }
);

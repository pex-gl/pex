define(
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HESelection',
    'pex/geom/hem/HEMarking',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude',
    'pex/geom/hem/HECatmullClark',
    'pex/geom/hem/HETriangulate',
    'pex/geom/hem/HESubdivideTriangles',
    'pex/geom/hem/HESubdivideFaceCenter',
    'pex/geom/hem/HEPull',
    'pex/geom/hem/HEDooSabin',
  ],
  function(HEMesh, HESelection, HEMarking, HEGeometryConverter, HEExtrude, HECatmullClark, HETriangulate,
    HESubdivideTriangles, HESubdivideFaceCenter, HEPull, HEDooSabin) {
    return function() {
      return new HEMesh();
    }
  }
);

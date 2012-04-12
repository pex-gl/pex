//Module wrapper for half-edge mesh related classes.
define([
  "pex/geom/hem/HEMesh",
  "pex/geom/hem/HEVertex",
  "pex/geom/hem/HEEdge",
  "pex/geom/hem/HEFace",
  "pex/geom/hem/CatmullClark",
  "pex/geom/hem/Extrude",
  "pex/geom/hem/HEGeometryConverter"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, CatmullClark, Extrude, HEGeometryConverter) {
    return {
      HEMesh : HEMesh,
      HEVertex : HEVertex,
      HEEdge : HEEdge,
      HEFace : HEFace,
      CatmullClark : CatmullClark,
      Extrude : Extrude,
      HEGeometryConverter : HEGeometryConverter
    };
});
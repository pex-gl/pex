//Module wrapper for half-edge mesh related classes.
define([
  "pex/geom/hem/HEMesh",
  "pex/geom/hem/HEVertex",
  "pex/geom/hem/HEEdge",
  "pex/geom/hem/HEFace",
  "pex/geom/hem/CatmullClark",
  "pex/geom/hem/Extrude"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, CatmullClark, Extrude) {
    return {
      HEMesh : HEMesh,
      HEVertex : HEVertex,
      HEEdge : HEEdge,
      HEFace : HEFace,
      CatmullClark : CatmullClark,
      Extrude : Extrude
    };
});
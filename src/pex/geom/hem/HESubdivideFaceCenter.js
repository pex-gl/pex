define([
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HESubdivideFaceCenter() {
  }

  HEMesh.prototype.subdivideFaceCenter = function() {
    var edgesToSelect = [];

    var faces = this.faces;
    var selectedFaces = this.getSelectedFaces();
    if (selectedFaces.length > 0) {
      faces = selectedFaces;
    }

    faces.forEach(function(face) {
      var newEdge = this.splitFaceAtPoint(face, face.getCenter());
      edgesToSelect.push(newEdge);
    }.bind(this));

    this.clearSelection();
    edgesToSelect.forEach(function(edge) {
      edge.vert.selected = true;
    });

    return this;
  };

  return HESubdivideFaceCenter;
});

define(['pex/geom/hem/HEMesh', 'pex/utils/ArrayUtils'], function(HEMesh, ArrayUtils) {

  function selected(o) { return o.selected; }

  function HESelection() {
  }

  HEMesh.prototype.clearVerticesSelection = function() {
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearEdgeSelection = function() {
    for(var i=0; i<this.edges.length; i++) {
      this.edges[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearFaceSelection = function() {
    for(var i=0; i<this.faces.length; i++) {
      this.faces[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearSelection = function() {
    this.clearVerticesSelection();
    this.clearEdgeSelection();
    this.clearFaceSelection();
    return this;
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomVertices = function(count) {
    count = (count === undefined) ? this.vertices.length/2 : count;
    count = Math.min(count, this.vertices.length);
    if (count <= 1) count = Math.floor(count * this.vertices.length);

    var vertices = this.vertices;
    this.clearSelection();

    function selectVertex(i) { vertices[i].selected = true; }

    var indexList = ArrayUtils.range(0, this.vertices.length);
    indexList = ArrayUtils.shuffled(indexList);
    indexList = ArrayUtils.first(indexList, count);
    indexList.forEach(selectVertex);

    return this;
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomFaces = function(count) {
    count = (count === undefined) ? this.faces.length/2 : count;
    count = Math.min(count, this.faces.length);
    if (count < 1) count = Math.floor(count * this.faces.length);

    var faces = this.faces;
    this.clearSelection();

    function selectFace(i) { faces[i].selected = true; }

    var indexList = ArrayUtils.range(0, this.faces.length);
    indexList = ArrayUtils.shuffled(indexList);
    indexList = ArrayUtils.first(indexList, count);
    indexList.forEach(selectFace);

    return this;
  };

  HEMesh.prototype.selectAllFaces = function() {
    function selectFace(f) { f.selected = true; }
    this.faces.forEach(selectFace);
    return this;
  };

  HEMesh.prototype.selectFace = function(face) {
    face.selected = true;
    return this;
  }

  HEMesh.prototype.expandVerticesSelectionToFaces = function() {
    this.vertices.filter(selected).forEach(function(vertex) {
      vertex.forEachFace(function(face) {
        face.selected = true;
      });
    });
    return this;
  };

  HEMesh.prototype.expandFaceSelection = function() {
    var neighborsToSelect = [];
    this.getSelectedFaces().forEach(function(face) {
      face.getNeighborFaces().forEach(function(neighborFace) {
        if (neighborsToSelect.indexOf(neighborFace) == -1) neighborsToSelect.push(neighborFace);
      });
    });
    function selectFace(face) { face.selected = true; }
    neighborsToSelect.forEach(selectFace);
    return this;
  };

  HEMesh.prototype.getSelectedVertices = function() {
    return this.vertices.filter(selected);
  };

  HEMesh.prototype.getSelectedFaces = function() {
    return this.faces.filter(selected);
  };

  HEMesh.prototype.hasSelection = function() {
    var selectedVertexCount = this.vertices.filter(selected).length;
    var selectedEdgesCount = this.edges.filter(selected).length;
    var selectedFacesCount = this.faces.filter(selected).length;

    return selectedVertexCount + selectedEdgesCount + selectedFacesCount > 0;
  };

  return HESelection;
});

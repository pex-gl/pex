var Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/core/Vec3",
  "pex/sys/Window",
  "pex/util/Time",
  "pex/cameras/PerspectiveCamera",
  "pex/cameras/Arcball",
  "pex/geom/Geom",
  "pex/materials/Materials",
  "pex/geom/hem/HEMesh",
  "pex/geom/hem/HEFace",
  "pex/geom/hem/HEEdge",
  "pex/geom/hem/HEVertex",
  "pex/geom/hem/CatmullClark",
  "pex/geom/hem/Extrude"
  ],
  function(Core, Vec3, Window, Time, PerspectiveCamera, Arcball, Geom, Materials, HEMesh, HEFace, HEEdge, HEVertex, CatmullClark, Extrude) {
    Window.create({
      settings: {
        width: 1280,
        height: 720,
        type: '3d',
        vsync: true,
        multisample: true,
        fullscreen: false,
        center: true
      },
      init: function() {
        var gl = Core.Context.currentContext.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        //this.camera.setPosition(new Core.Vec3(0,3,3));
        this.arcball = new Arcball(this, this.camera, 5);

        var hemesh = new HEMesh();

        hemesh.vertices.push(new HEVertex( 1, 1, 1)); //trf 0
        hemesh.vertices.push(new HEVertex(-1, 1, 1)); //tlf 1
        hemesh.vertices.push(new HEVertex(-1,-1, 1)); //blf 2
        hemesh.vertices.push(new HEVertex( 1,-1, 1)); //brf 3
        hemesh.vertices.push(new HEVertex( 1, 1,-1)); //trb 4
        hemesh.vertices.push(new HEVertex(-1, 1,-1)); //tlb 5
        hemesh.vertices.push(new HEVertex(-1,-1,-1)); //blb 6
        hemesh.vertices.push(new HEVertex( 1,-1,-1)); //brb 7

        var self = this;
        this.selection = [];

        function addFace4(a, b, c, d) {
          var face = new HEFace();

          self.selection.push(face);

          var edge0 = new HEEdge(a, null, face, null);
          var edge1 = new HEEdge(b, null, face, null);
          var edge2 = new HEEdge(c, null, face, null);
          var edge3 = new HEEdge(d, null, face, null);

          edge0.next = edge1;
          edge1.next = edge2;
          edge2.next = edge3;
          edge3.next = edge0;

          hemesh.edges.push(edge0);
          hemesh.edges.push(edge1);
          hemesh.edges.push(edge2);
          hemesh.edges.push(edge3);

          face.edge = edge0;
          hemesh.faces.push(face);
        }

        addFace4(hemesh.vertices[0], hemesh.vertices[1], hemesh.vertices[2], hemesh.vertices[3]);
        addFace4(hemesh.vertices[4], hemesh.vertices[0], hemesh.vertices[3], hemesh.vertices[7]);
        addFace4(hemesh.vertices[5], hemesh.vertices[4], hemesh.vertices[7], hemesh.vertices[6]);
        addFace4(hemesh.vertices[1], hemesh.vertices[5], hemesh.vertices[6], hemesh.vertices[2]);
        addFace4(hemesh.vertices[4], hemesh.vertices[5], hemesh.vertices[1], hemesh.vertices[0]);
        addFace4(hemesh.vertices[3], hemesh.vertices[2], hemesh.vertices[6], hemesh.vertices[7]);

        hemesh.assignEdgesToVertices();
        hemesh.assignEdgePairs();

        //hemesh.vertices[0].selected = true;
        //hemesh.vertices[0].edge.next.next.vert.selected = true;
        //hemesh.vertices[0].edge.selected = true;
        var newVertPos = hemesh.vertices[0].dup();
        newVertPos.add(hemesh.vertices[0].edge.next.vert.subbed(hemesh.vertices[0]).scale(0.5));


        hemesh.clearEdgeSelection();
        //hemesh.vertices[0].edge.face.selected = true;

        //var newEdge = hemesh.splitVertex(hemesh.vertices[0], newVertPos, hemesh.vertices[0].edge, hemesh.vertices[0].edge);
        //hemesh.splitFace(hemesh.vertices[0].edge.findPrev(), newEdge);
        //var newEdge = hemesh.splitVertex(hemesh.vertices[0], hemesh.vertices[0].edge.face.getCenter(), null, null);
        //hemesh.splitFace(newEdge.next, newEdge.next.next.next);
        //hemesh.splitFace(newEdge.next, newEdge.next.next.next);
        //hemesh.splitFace(newEdge.next, newEdge.next.next.next);

        var topFace = hemesh.vertices[0].edge.face;
        //hemesh.splitFaceAtPoint(topFace, topFace.getCenter());
        //hemesh.splitFaceAtPoint(topFace, topFace.getCenter());
        //hemesh.splitFaceAtPoint(topFace, topFace.getCenter());

        hemesh.check();


        var numEdges = hemesh.edges.length;
        //hemesh.clearEdgeSelection();
        for(var i=0; i<numEdges; i++) {
          var edge = hemesh.edges[i];
          if (edge.selected) {
            continue;
          }

          //edge.selected = true;
          //edge.pair.selected = true;

          //hemesh.splitEdge(edge);
        }



        var catmullClark = new CatmullClark();
        var extrude = new Extrude();
        //hemesh = extrude.apply(hemesh, 2.5, self.selection);
        //hemesh = catmullClark.apply(hemesh);
        //hemesh = catmullClark.apply(hemesh);
        //hemesh = catmullClark.apply(hemesh);
        //hemesh = catmullClark.apply(hemesh);
        //hemesh = catmullClark.apply(hemesh);
        //console.log(hemesh.vertices.length, hemesh.edges.length);

        var scale = 1;
        var subdivisionLevel = 0;
        var selection = null;
        this.on('keyDown', function(e) {
          if (e.keyCode == 48 || e.str == 's') {
            Time.startMeasuringTime();
            subdivisionLevel++
            hemesh = catmullClark.apply(hemesh);
            Time.stopMeasuringTime("Camtull-Clark subdivision at level:" + subdivisionLevel + " = ");
            Time.startMeasuringTime();
            self.buildLineMesh(hemesh);
            self.buildFlatMesh(hemesh);
            Time.stopMeasuringTime("Building line mesh at level:" + subdivisionLevel + " = ");
            //this.buildSolidMesh(hemesh);

            self.selection = [];
          }
          else if (e.str == ' ') {
            if (!self.selection)
              for(var i=0; i<hemesh.faces.length; i++) {
                self.selection.push(hemesh.faces[i]);
              }
            Time.startMeasuringTime();
            hemesh = extrude.apply(hemesh, scale, self.selection);
            Time.stopMeasuringTime("Extrude at level:" + subdivisionLevel + " = ");
            scale *= 0.75;
            self.buildLineMesh(hemesh);
            self.buildFlatMesh(hemesh);
            //self.buildSolidMesh(hemesh);
          }
        })

        var edge01 = hemesh.getEdgeBetween(hemesh.vertices[0], hemesh.vertices[1]);

        //select edge
        //edge01.selected = 1;
        //edge01.pair.next.selected = 1;
        //edge01.pair.next.pair.next.selected = 1;

        //select edge face
        //var selectedEdge = edge01;
        //do {
        //  selectedEdge.selected = 1;
        //  selectedEdge = selectedEdge.next;
        //} while(selectedEdge != edge01);

        //edge01.pair.next.selected = 1;

        //drawing

        this.buildLineMesh(hemesh);
        //this.buildSolidMesh(hemesh);
        this.buildFlatMesh(hemesh);
        this.framerate(30);
      },
      buildLineMesh: function(hemesh) {
        var lineBuilder = new Geom.LineBuilder();
        if (hemesh.vertices.length < 100) {
          for(var i in hemesh.vertices) {
            lineBuilder.addGizmo(hemesh.vertices[i], 0.01, hemesh.vertices[i].selected ? Core.Color.Red : Core.Color.Black);
          }
        }

        var i = 0;
        for(var i in hemesh.faces) {
          var face = hemesh.faces[i];

          //collect all the vertices of a face
          var faceVertices = [];
          var edge = face.edge;
          do {
            faceVertices.push(edge.vert);
            edge = edge.next;
          } while(edge != face.edge);

          var center = face.getCenter();

          //drawing all the adges of the face shifted a bit towards the center
          for(var j=0; j<faceVertices.length; j++) {
            var a = faceVertices[j];
            var b = faceVertices[(j+1)%faceVertices.length];
            var ac = center.subbed(a).scale(0.01);
            var bc = center.subbed(b).scale(0.01);
            ac.add(a);
            bc.add(b);
            var edgeAB = hemesh.getEdgeBetween(a, b);
            var selected = edgeAB.selected || face.selected;
            lineBuilder.addLine(ac, bc, selected ? Core.Color.Red : Core.Color.Black);
          }

          //drawing face normals
          var normal = face.getNormal();
          //lineBuilder.addLine(center, center.added(normal.scaled(0.1)), Core.Color.Green);
        }

        this.lineMesh = new Core.Mesh(lineBuilder, new Materials.ShowColorMaterial(), {useEdges:true, primitiveType:Core.Geometry.LINES});
      },
      buildSolidMesh: function(hemesh) {
        var geometry = new Core.Geometry();
        geometry.vertices = [];
        geometry.faces = [];
        geometry.normals = [];

        for(var i in hemesh.vertices) {
          geometry.vertices.push(hemesh.vertices[i]);
          geometry.normals.push(hemesh.vertices[i].getNormal());
        }

        for(var i in hemesh.faces) {
          var faceVertices = hemesh.faces[i].getAllVertices();
          var faceVertexIndices = [];
          for(var j=0; j<faceVertices.length; j++) {
            faceVertexIndices[j] = geometry.vertices.indexOf(faceVertices[j]);
          }
          if (faceVertices.length == 3) {
            geometry.faces.push(new Core.Face3(faceVertexIndices[0], faceVertexIndices[1], faceVertexIndices[2]));
          }
          else if (faceVertices.length == 4){
            geometry.faces.push(new Core.Face4(faceVertexIndices[0], faceVertexIndices[1], faceVertexIndices[2], faceVertexIndices[3]));
          }
          else {
            throw "Invalid mesh. Only triangles and quads are supported. Not " + faceVertices.length + "-gons";
          }
        }
        this.mesh = new Core.Mesh(geometry, new Materials.TestMaterial());
      },
      buildFlatMesh: function(hemesh) {
        var geometry = new Core.Geometry();
        geometry.vertices = [];
        geometry.faces = [];
        geometry.normals = [];

        var idx = 0;
        for(var i in hemesh.faces) {
          var face = hemesh.faces[i];
          var faceVertices = face.getAllVertices();
          for(var j in faceVertices) {
            var v = faceVertices[j];
            geometry.vertices.push(new Core.Vec3(v.x, v.y, v.z));
            geometry.normals.push(face.getNormal());
          }
          if (faceVertices.length == 3) {
            geometry.faces.push(new Core.Face3(idx++, idx++, idx++));
          }
          else if (faceVertices.length == 4){
            geometry.faces.push(new Core.Face4(idx++, idx++, idx++, idx++));
          }
          else {
            throw "Invalid mesh. Only triangles and quads are supported. Not " + faceVertices.length + "-gons";
          }
        }
        console.log("geometry v:" + geometry.vertices.length);
        this.mesh = new Core.Mesh(geometry, new Materials.TestMaterial());
      },
      draw: function() {
        var gl = Core.Context.currentContext.gl;
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.mesh) this.mesh.draw(this.camera);
        if (this.lineMesh) this.lineMesh.draw(this.camera);
      }
    });
  }
);


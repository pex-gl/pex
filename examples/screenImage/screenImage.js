(function() {
  var Arcball, Color, Cube, IO, LineBuilder, Mesh, PerspectiveCamera, ShowColors, SolidColor, Texture2D, Textured, Vec3, pex, _ref, _ref1, _ref2, _ref3;

  pex = pex || require('../../build/pex');

  Vec3 = pex.geom.Vec3;

  _ref = pex.geom.gen, LineBuilder = _ref.LineBuilder, Cube = _ref.Cube;

  Color = pex.color.Color;

  _ref1 = pex.gl, Mesh = _ref1.Mesh, Texture2D = _ref1.Texture2D;

  _ref2 = pex.materials, ShowColors = _ref2.ShowColors, SolidColor = _ref2.SolidColor, Textured = _ref2.Textured;

  IO = pex.sys.IO;

  _ref3 = pex.scene, PerspectiveCamera = _ref3.PerspectiveCamera, Arcball = _ref3.Arcball;

  pex.sys.Window.create({
    settings: {
      width: 1200,
      height: 600,
      type: '3d'
    },
    init: function() {
      var lineBuilder;
      this.camera = new PerspectiveCamera(60, 1);
      this.arcball = new Arcball(this, this.camera);
      this.camera.setPosition(new Vec3(1, 1, 2));
      this.gui = new pex.gui.GUI(this);
      this.gui.addLabel("Img / tl 0, 0").setPosition(10, 10);
      this.gui.addLabel("Img RT / tl 300, 0").setPosition(310, 10);
      this.gui.addLabel("OpenGL / bl 0, 0").setPosition(10, 310);
      this.gui.addLabel("RT / tl 300, 0").setPosition(610, 10);
      this.gui.addLabel("RT RT / tl 300, 0").setPosition(910, 10);
      this.gui.addLabel("RT Tex Cube / bl 300, 0").setPosition(610, 310);
      this.gui.addLabel("Img Tex Cube / bl 300, 0").setPosition(910, 310);
      this.bgCube = new Mesh(new Cube(100, 100, 100), new SolidColor());
      this.screenshot = new pex.gl.ScreenImage(Texture2D.load('screenshot.png'), 0, 0, 300, 300, this.width, this.height);
      this.rt = new pex.gl.RenderTarget(300, 300, {
        depth: true
      });
      this.rtImage = new pex.gl.ScreenImage(this.rt.getColorAttachement(0), 600, 0, 300, 300, this.width, this.height);
      this.rtImg = new pex.gl.RenderTarget(300, 300, {
        depth: true
      });
      this.rtImgFSQ = new pex.gl.ScreenImage(this.screenshot.image, 0, 0, 1, 1, 1, 1);
      this.rtImgImage = new pex.gl.ScreenImage(this.rtImg.getColorAttachement(0), 300, 0, 300, 300, this.width, this.height);
      this.rt2 = new pex.gl.RenderTarget(300, 300, {
        depth: true
      });
      this.rtFSQ2 = new pex.gl.ScreenImage(this.rt.getColorAttachement(0), 0, 0, 1, 1, 1, 1);
      this.rtImage2 = new pex.gl.ScreenImage(this.rt2.getColorAttachement(0), 900, 0, 300, 300, this.width, this.height);
      this.texCube = new Mesh(new Cube(1, 1, 1), new Textured({
        texture: this.rt.getColorAttachement(0)
      }));
      lineBuilder = new LineBuilder();
      lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(1, 0, 0), Color.Red);
      lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(0, 1, 0), Color.Green);
      lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(0, 0, 1), Color.Blue);
      this.lineMesh = new Mesh(lineBuilder, new ShowColors(), {
        useEdges: true
      });
      return null;
    },
    draw: function() {
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.clearColor(0.0, 0.0, 0.0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.clearColor(0.5, 0.5, 0.5, 1);
      this.gl.lineWidth(4);
      this.gl.viewport(0, 0, this.width, this.height);
      this.screenshot.draw();
      this.gl.viewport(0, 0, 300, 300);
      this.bgCube.material.uniforms.color = new Color(0.6, 0.5, 0.5, 1.0);
      this.bgCube.draw(this.camera);
      this.lineMesh.draw(this.camera);
      this.gl.viewport(0, 0, 300, 300);
      this.rt.bind();
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.bgCube.material.uniforms.color = new Color(0.6, 0.6, 0.5, 1.0);
      this.bgCube.draw(this.camera);
      this.lineMesh.draw(this.camera);
      this.rt.unbind();
      this.gl.viewport(0, 0, this.width, this.height);
      this.rtImage.draw();
      this.gl.viewport(0, 0, 300, 300);
      this.rtImg.bind();
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.rtImgFSQ.draw();
      this.rtImg.unbind();
      this.gl.viewport(0, 0, this.width, this.height);
      this.rtImgImage.draw();
      this.gl.viewport(600, 0, 300, 300);
      this.bgCube.material.uniforms.color = new Color(0.5, 0.5, 0.6, 1.0);
      this.bgCube.draw(this.camera);
      this.texCube.draw(this.camera);
      this.gl.viewport(900, 0, 300, 300);
      this.bgCube.material.uniforms.color = new Color(0.5, 0.5, 0.6, 1.0);
      this.bgCube.draw(this.camera);
      this.texCube.draw(this.camera);
      this.gl.viewport(0, 0, 300, 300);
      this.rt2.bind();
      this.gl.clearColor(0.0, 0.0, 1.0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.rtFSQ2.draw();
      this.rt2.unbind();
      this.gl.viewport(0, 0, this.width, this.height);
      this.rtImage2.draw();
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.disable(this.gl.DEPTH_TEST);
      return this.gui.draw();
    }
  });

}).call(this);

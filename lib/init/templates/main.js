var Window          = require('pex-sys/Window');
var Screen          = require('pex-sys/Screen');
var Mat4            = require('pex-math/Mat4');
var Vec3            = require('pex-math/Vec3');
var createCube      = require('primitive-cube');
var glslify         = require('glslify-promise');
var PerspCamera     = require('pex-cam/PerspCamera');
var Arcball         = require('pex-cam/Arcball');
var isBrowser       = require('is-browser');

Window.create({
    settings: {
        width:  1280,
        height: 720,
        fullScreen: isBrowser ? true : true
    },
    resources: {
        solidColorVert: { glsl: glslify(__dirname + '/assets/SolidColor.vert') },
        solidColorFrag: { glsl: glslify(__dirname + '/assets/SolidColor.frag') },
        showNormalsVert: { glsl: glslify(__dirname + '/assets/ShowNormals.vert') },
        showNormalsFrag: { glsl: glslify(__dirname + '/assets/ShowNormals.frag') },
        showTexCoordsVert: { glsl: glslify(__dirname + '/assets/ShowTexCoords.vert') },
        showTexCoordsFrag: { glsl: glslify(__dirname + '/assets/ShowTexCoords.frag') }
    },
    init: function() {
        var ctx = this.getContext();
        var res = this.getResources();

        this.camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this.camera.lookAt([0, 1, 4], [0, 0, 0]);
        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.arcball.setDistance(5.0);
        this.addEventListener(this.arcball);

        this.solidColorProgram = ctx.createProgram(res.solidColorVert, res.solidColorFrag);
        ctx.bindProgram(this.solidColorProgram);

        this.showNormalsProgram = ctx.createProgram(res.showNormalsVert, res.showNormalsFrag);
        ctx.bindProgram(this.showNormalsProgram);

        this.showTexCoordsProgram = ctx.createProgram(res.showTexCoordsVert, res.showTexCoordsFrag);
        ctx.bindProgram(this.showTexCoordsProgram);

        var cube = createCube();
        var cubeAttributes = [
            { data: cube.positions, location: ctx.ATTRIB_POSITION },
            { data: cube.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: cube.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var cubeIndices = { data: cube.cells };
        this.cubeMesh = ctx.createMesh(cubeAttributes, cubeIndices, ctx.TRIANGLES);
    },
    draw: function() {
        var ctx = this.getContext();

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        ctx.bindMesh(this.cubeMesh);

        ctx.bindProgram(this.solidColorProgram);
        this.solidColorProgram.setUniform('uColor', [1, 0, 1, 1]);
        ctx.pushModelMatrix();
        ctx.translate([-1.5, 0, 0]);
        ctx.drawMesh();
        ctx.popModelMatrix();

        ctx.bindProgram(this.showNormalsProgram);
        ctx.drawMesh();

        ctx.bindProgram(this.showTexCoordsProgram);
        ctx.pushModelMatrix();
        ctx.translate([ 1.5, 0, 0]);
        ctx.drawMesh();
        ctx.popModelMatrix();
    }
})

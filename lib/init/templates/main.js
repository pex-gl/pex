//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createSphere = require('primitive-sphere');
var glslify     = require('glslify-promise');
var PerspCamera  = require('pex-cam/PerspCamera');
var Arcball      = require('pex-cam/Arcball');


Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    resources: {
        showColorsVert: { glsl: glslify(__dirname + '/assets/ShowColors.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/assets/ShowColors.frag') },
        showNormalsVert: { glsl: glslify(__dirname + '/assets/ShowNormals.vert') },
        showNormalsFrag: { glsl: glslify(__dirname + '/assets/ShowNormals.frag') },
        basicVert: { glsl: glslify(__dirname + '/assets/Basic.vert') },
        basicFrag: { glsl: glslify(__dirname + '/assets/Basic.frag') },
    },
    init: function() {
        var ctx = this.getContext();

        try {

        this.camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this.camera.lookAt([2, 1, 2], [0, 0, 0]);

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.arcball.setDistance(3.0);
        this.addEventListener(this.arcball);

        var res = this.getResources();

        this.program = ctx.createProgram(res.basicVert, res.basicFrag);
        ctx.bindProgram(this.program);

        var sphere = createSphere(0.5, { segments: 2 });
        var sphereAttributes = [
            { data: sphere.positions, location: ctx.ATTRIB_POSITION },
            //{ data: sphere.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            //{ data: sphere.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var sphereIndices = { data: sphere.cells };
        this.sphereMesh = ctx.createMesh(sphereAttributes, sphereIndices, ctx.LINES);
        }
        catch(e) {
            console.log(e)
        }
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        var now = Date.now();
        this.delta = (now - this.prevTime)/1000;
        this.seconds += this.delta;
        this.prevTime = now;

        var ctx = this.getContext();

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        ctx.bindProgram(this.program);
        ctx.bindMesh(this.sphereMesh);
        ctx.drawMesh();
    }
})

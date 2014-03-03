//Module wrapper for gl classes.
define([
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/gl/Mesh',
  'pex/gl/Texture2D',
  'pex/gl/RenderTarget',
  'pex/gl/ScreenImage',
  'pex/gl/Buffer',
  'pex/gl/RenderableGeometry',
  'pex/gl/TextureCube',
  'pex/gl/Viewport'
], function (Context, Program, Mesh, Texture2D, RenderTarget, ScreenImage, Buffer, RenderableGeometry, TextureCube, Viewport) {
  return {
    Context: Context,
    Program: Program,
    Mesh: Mesh,
    Texture2D: Texture2D,
    RenderTarget: RenderTarget,
    ScreenImage: ScreenImage,
    Buffer: Buffer,
    RenderableGeometry: RenderableGeometry,
    TextureCube: TextureCube,
    Viewport: Viewport
  };
});
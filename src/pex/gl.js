//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Mesh',
    'pex/gl/Texture2D',
    'pex/gl/RenderTarget',
    'pex/gl/ScreenImage'
  ],
  function(Context, Program, Mesh, Texture2D, RenderTarget, ScreenImage) {
    return {
      Context : Context,
      Program : Program,
      Mesh : Mesh,
      Texture2D : Texture2D,
      RenderTarget : RenderTarget,
      ScreenImage : ScreenImage
    };
  }
);
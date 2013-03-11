//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Mesh',
    'pex/gl/Texture2D'
  ],
  function(Context, Program, Mesh, Texture2D) {
    return {
      Context : Context,
      Program : Program,
      Mesh : Mesh,
      Texture2D : Texture2D
    };
  }
);

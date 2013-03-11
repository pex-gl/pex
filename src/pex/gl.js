//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Mesh'
  ],
  function(Context, Program, Mesh) {
    return {
      Context : Context,
      Program : Program,
      Mesh : Mesh
    };
  }
);

//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Material'
  ],
  function(Context) {
    return {
      Context : Context,
      Program : Program,
      Material : Material
    };
  }
);

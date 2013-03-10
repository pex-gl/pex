//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Material',
    'pex/gl/materials'
  ],
  function(Context, Program, Material, materials) {
    return {
      Context : Context,
      Program : Program,
      Material : Material,
      materials : materials
    };
  }
);

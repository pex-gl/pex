//Module wrapper for gl classes.
define(
  [
    'pex/gl/Context',
    'pex/gl/Program'
  ],
  function(Context, Program) {
    return {
      Context : Context,
      Program : Program
    };
  }
);

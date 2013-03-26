define(
  [
    'pex/fx/FXGraph',
    'pex/fx/Render',
    'pex/fx/Blit',
  ],
  function(FXGraph, Render, Blit) {
    var globalFx;
    return function(source) {
      if (!globalFx) {
        globalFx = new FXGraph();
      }

      if (source) {
        globalFx.use(source);
      }
      else {
        globalFx.reset();
      }
      return globalFx;
    }
  }
);

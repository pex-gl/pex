define(
  [
    'pex/fx/FXGraph',
    'pex/fx/Render',
    'pex/fx/Blit',
    'pex/fx/Downsample2',
    'pex/fx/Downsample4'
  ],
  function(FXGraph, Render, Blit, Downsample2, Downsample4) {
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

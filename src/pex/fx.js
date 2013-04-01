define(
  [
    'pex/fx/FXStage',
    'pex/fx/Render',
    'pex/fx/Blit',
    'pex/fx/Downsample2',
    'pex/fx/Downsample4',
    'pex/fx/Blur3',
    'pex/fx/Blur5',
    'pex/fx/Blur7'
  ],
  function(FXStage, Render, Blit, Downsample2, Downsample4, Blur3, Blur5, Blur7) {
    var globalFx;
    return function() {
      if (!globalFx) {
        globalFx = new FXStage();
      }
      globalFx.reset();
      return globalFx;
    }
  }
);

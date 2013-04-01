define(
  [
    'pex/fx/FXStage',
    'pex/fx/Render',
    'pex/fx/Blit',
    'pex/fx/Downsample2',
    'pex/fx/Downsample4',
    'pex/fx/Blur3',
    'pex/fx/Blur5',
    'pex/fx/Blur7',
    'pex/fx/Add',
    'pex/fx/Threshold',
    'pex/fx/Image'
  ],
  function(FXStage, Render, Blit, Downsample2, Downsample4, Blur3, Blur5, Blur7, Add, Threshold, Image) {
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

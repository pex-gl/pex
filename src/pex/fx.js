define(
  [
    'pex/fx/FXGraph',
    'pex/fx/Render',
    'pex/fx/Blit',
    'pex/fx/Downsample2',
    'pex/fx/Downsample4',
    'pex/fx/Blur3',
    'pex/fx/Blur5',
    'pex/fx/Blur7'
  ],
  function(FXGraph, Render, Blit, Downsample2, Downsample4, Blur3, Blur5, Blur7) {
    var globalFx;
    return function(reset) {
      if (typeof reset === undefined) reset = true;

      if (!globalFx) {
        globalFx = new FXGraph();
      }
      else if (reset) {
        console.log('resetting');
        globalFx.reset();
      }
      return globalFx;
    }
  }
);

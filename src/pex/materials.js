//Module wrapper for materials classes.
define(
  [
    'pex/materials/SolidColor',
    'pex/materials/ShowNormals',
    'pex/materials/Textured',
    'pex/materials/ShowTexCoords',
    'pex/materials/ShowDepth',
    'pex/materials/ShowColors',
    'pex/materials/PackDepth',
    'pex/materials/Diffuse',
  ],
  function(SolidColor, ShowNormals, Textured, ShowTexCoords, ShowDepth, ShowColors, PackDepth, Diffuse) {
    return {
      SolidColor : SolidColor,
      ShowNormals : ShowNormals,
      Textured : Textured,
      ShowTexCoords : ShowTexCoords,
      ShowDepth : ShowDepth,
      ShowColors : ShowColors,
      PackDepth : PackDepth,
      Diffuse : Diffuse
    };
  }
);

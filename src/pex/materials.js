//Module wrapper for materials classes.
define(
  [
    "pex/materials/SolidColor",
    "pex/materials/ShowNormals",
    "pex/materials/Textured",
    "pex/materials/ShowTexCoords"
  ],
  function(SolidColor, ShowNormals, Textured, ShowTexCoords) {
    return {
      SolidColor : SolidColor,
      ShowNormals : ShowNormals,
      Textured : Textured,
      ShowTexCoords : ShowTexCoords
    };
  }
);

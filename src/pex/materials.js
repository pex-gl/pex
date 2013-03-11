//Module wrapper for materials classes.
define(
  [
    "pex/materials/SolidColor",
    "pex/materials/ShowNormals"
  ],
  function(SolidColor, ShowNormals) {
    return {
      SolidColor : SolidColor,
      ShowNormals : ShowNormals
    };
  }
);

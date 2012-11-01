//Module wrapper for material classes.
define([
  "pex/materials/SolidColorMaterial",
  "pex/materials/ShowColorMaterial",
  "pex/materials/TestMaterial",
  "pex/materials/TexturedMaterial",
  "pex/materials/DiffuseMaterial",
  "pex/materials/ShowTexCoordsMaterial",
  "pex/materials/ShowNormalMaterial",
  "pex/materials/ShowDepthMaterial"
  ],
  function(
    SolidColorMaterial,
    ShowColorMaterial,
    TestMaterial,
    TexturedMaterial,
    DiffuseMaterial,
    ShowTexCoordsMaterial,
    ShowNormalMaterial,
    ShowDepthMaterial
  ) {
    var Materials = {
      SolidColorMaterial : SolidColorMaterial,
      ShowColorMaterial : ShowColorMaterial,
      TestMaterial : TestMaterial,
      TexturedMaterial : TexturedMaterial,
      DiffuseMaterial : DiffuseMaterial,
      ShowTexCoordsMaterial : ShowTexCoordsMaterial,
      ShowNormalMaterial : ShowNormalMaterial,
      ShowDepthMaterial : ShowDepthMaterial
    };

    return Materials;
  }
);
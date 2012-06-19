//Module wrapper for material classes.
define([
  "pex/materials/SolidColorMaterial",
  "pex/materials/ShowColorMaterial",
  "pex/materials/TestMaterial",
  "pex/materials/TexturedMaterial",
  "pex/materials/DiffuseMaterial",
  "pex/materials/ShowTexCoordsMaterial",
  "pex/materials/ShowNormalMaterial"
  ],
  function(
    SolidColorMaterial,
    ShowColorMaterial,
    TestMaterial,
    TexturedMaterial,
    DiffuseMaterial,
    ShowTexCoordsMaterial,
    ShowNormalMaterial
  ) {
    var Materials = {
      SolidColorMaterial : SolidColorMaterial,
      ShowColorMaterial : ShowColorMaterial,
      TestMaterial : TestMaterial,
      TexturedMaterial : TexturedMaterial,
      DiffuseMaterial : DiffuseMaterial,
      ShowTexCoordsMaterial : ShowTexCoordsMaterial,
      ShowNormalMaterial : ShowNormalMaterial
    };

    return Materials;
  }
);
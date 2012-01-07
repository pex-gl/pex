//Module wrapper for material classes.
define([
  "pex/materials/SolidColorMaterial",
  "pex/materials/ShowColorMaterial",
  "pex/materials/TestMaterial",
  "pex/materials/TexturedMaterial",
  "pex/materials/DiffuseMaterial"
  ],
  function(
    SolidColorMaterial,
    ShowColorMaterial,
    TestMaterial,
    TexturedMaterial,
    DiffuseMaterial
  ) {
    var Materials = {
      SolidColorMaterial : SolidColorMaterial,
      ShowColorMaterial : ShowColorMaterial,
      TestMaterial : TestMaterial,
      TexturedMaterial : TexturedMaterial,
      DiffuseMaterial : DiffuseMaterial
    };

    return Materials;
  }
);
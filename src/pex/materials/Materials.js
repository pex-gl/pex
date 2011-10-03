define([
  "pex/materials/SolidColorMaterial",
  "pex/materials/TestMaterial",
  "pex/materials/TexturedMaterial",
  "pex/materials/DiffuseMaterial"
  ],
  function(
    SolidColorMaterial,
    TestMaterial,
    TexturedMaterial,
    DiffuseMaterial
  ) {
    var Materials = {
      SolidColorMaterial : SolidColorMaterial,
      TestMaterial : TestMaterial,
      TexturedMaterial : TexturedMaterial,
      DiffuseMaterial : DiffuseMaterial
    };

    return Materials;
  }
);
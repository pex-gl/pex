define([
  "pex/materials/SolidColorMaterial",
  "pex/materials/TestMaterial",
  "pex/materials/TexturedMaterial"
  ],
  function(
    SolidColorMaterial,
    TestMaterial,
    TexturedMaterial
  ) {
    var Materials = {
      SolidColorMaterial : SolidColorMaterial,
      TestMaterial : TestMaterial,
      TexturedMaterial : TexturedMaterial
    };

    return Materials;
  }
);
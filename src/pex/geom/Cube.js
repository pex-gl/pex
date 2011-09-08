define(["pex/core/Core"], function(Core) {
  function Cube() {
    this.positions = [
      new Core.Vec3(-1,  1,  1), //FTL 0           0--1
      new Core.Vec3( 1,  1,  1), //FTR 1           | /|
      new Core.Vec3( 1, -1,  1), //FBR 2           3--2
      new Core.Vec3(-1, -1,  1), //FBL 3            
      new Core.Vec3(-1,  1, -1), //BTL 4           4--5  
      new Core.Vec3( 1,  1, -1), //BTR 5           | \|
      new Core.Vec3( 1, -1, -1), //BBR 6           7--6
      new Core.Vec3(-1, -1, -1)  //BBL 7            
    ];
    
    this.indices = [
      0, 3, 1, //Front
      1, 3, 2,  
      5, 6, 4, //Back
      4, 6, 7,
      4, 7, 0, //Left
      0, 7, 3,
      1, 2, 5, //Right
      5, 2, 6,
      4, 0, 5, //Top
      5, 0, 1,
      3, 7, 2, //Bottom
      2, 7, 6
    ];
  }
  
  return Cube;
});
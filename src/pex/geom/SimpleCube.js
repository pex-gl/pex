define(["pex/core/Core"], function(Core) {
  function SimpleCube(size) {    
    size = size || 1;
    var s = size/2;
    this.vertices = [
      new Core.Vec3(-s,  s,  s), //FTL 0           0--1
      new Core.Vec3( s,  s,  s), //FTR 1           | /|
      new Core.Vec3( s, -s,  s), //FBR 2           3--2
      new Core.Vec3(-s, -s,  s), //FBL 3            
      new Core.Vec3(-s,  s, -s), //BTL 4           4--5  
      new Core.Vec3( s,  s, -s), //BTR 5           | \|
      new Core.Vec3( s, -s, -s), //BBR 6           7--6
      new Core.Vec3(-s, -s, -s)  //BBL 7            
    ];

    this.faces = [
      new Core.Face3(0, 3, 1), //Front
      new Core.Face3(1, 3, 2),  
      new Core.Face3(5, 6, 4), //Back
      new Core.Face3(4, 6, 7),
      new Core.Face3(4, 7, 0), //Left
      new Core.Face3(0, 7, 3),
      new Core.Face3(1, 2, 5), //Right
      new Core.Face3(5, 2, 6),
      new Core.Face3(4, 0, 5), //Top
      new Core.Face3(5, 0, 1),
      new Core.Face3(3, 7, 2), //Bottom
      new Core.Face3(2, 7, 6)
    ];
  }
  return SimpleCube;
});

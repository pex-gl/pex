//RGBA color.

//## Example use
//     var c1 = new Color(1.0, 0.0, 0.0, 1.0); //red
//     var c2 = Color.Red; //red

//## Reference
define(["pex/core/Vec4"], function(Vec4) {
  //### Color ( r, g, b, a )
  //`r` - red value *{ Number }* <0, 1> = 1  
  //`g` - green value *{ Number }* <0, 1> = 1  
  //`b` - blue value *{ Number }* <0, 1> = 1  
  //`a` - alpha - transparency value *{ Number }* <0, 1> = 1  
  function Color(r, g, b, a) {
    this.r = (r !== undefined) ? r : 1;
    this.g = (g !== undefined) ? g : 1;
    this.b = (b !== undefined) ? b : 1;
    this.a = (a !== undefined) ? a : 1;
  }

  //### toVec4 ( )
  //Returns vector representation of the color where RGBA is mapped to XYZW *{ Vec4 }*
  Color.prototype.toVec4 = function() {
    return new Vec4(this.r, this.g, this.b, this.a);
  }

  //### toArray ( )
  //Returns [r,g,b,a] array the color components *{ Array of Number }*
  Color.prototype.toArray = function() {
    return [this.r, this.g, this.b, this.a];
  }

  Color.fromVec4 = function(v) {
    var n = v.normalized();
    return new Color(n.x*0.5 + 0.5, n.y*0.5 + 0.5, n.z*0.5 + 0.5, 1.0);
  }

  //### Predefinied Colors
  Color.Black = new Color(0, 0, 0, 1);
  Color.White = new Color(1, 1, 1, 1);
  Color.Grey = new Color(0.5, 0.5, 0.5, 1);
  Color.Red = new Color(1, 0, 0, 1);
  Color.Green = new Color(0, 1, 0, 1);
  Color.Blue = new Color(0, 0, 1, 1);
  Color.Yellow = new Color(1, 1, 0, 1);
  Color.Pink = new Color(1, 0, 1, 1);
  Color.Cyan = new Color(0, 1, 1, 1);
  Color.Orange = new Color(1, 0.5, 0, 1);

  return Color;
});
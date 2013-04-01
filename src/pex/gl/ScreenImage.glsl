#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5;
  float ty = position.y * 0.5 + 0.5;
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;
  float y = (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0 - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D image;
uniform float alpha;

void main() {
  gl_FragColor = texture2D(image, vTexCoord);
  gl_FragColor.a *= alpha;
}

#endif
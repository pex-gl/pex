#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 windowSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float x = (pixelPosition.x + pixelSize.x * position.x)/windowSize.x;
  float y = (pixelPosition.y + pixelSize.y * position.y)/windowSize.y;
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
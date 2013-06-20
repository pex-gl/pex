#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;

varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;

uniform sampler2D image;
uniform vec2 imageSize;

void main() {
  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);

  vec4 color = vec4(0.0);
  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x * -2.0, 0.0));
  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x * -1.0, 0.0));
  color += 6.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  0.0, 0.0));
  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  1.0, 0.0));
  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  2.0, 0.0));
  gl_FragColor = color;
}

#endif

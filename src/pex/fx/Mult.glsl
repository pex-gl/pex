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
uniform sampler2D tex0;
uniform sampler2D tex1;

void main() {
  vec4 color = texture2D(tex0, vTexCoord);
  vec4 color2 = texture2D(tex1, vTexCoord);

  gl_FragColor = color * color2;
}

#endif
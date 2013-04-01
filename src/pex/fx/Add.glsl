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
uniform float scale;

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  vec4 color2 = texture2D(tex1, vTexCoord).rgba;

  //color += scale * color2 * color2.a;

  gl_FragColor = 1.0 - (1.0 - color) * (1.0 - color2 * scale);

  //gl_FragColor.rgba = color + scale * color2;
  //gl_FragColor.a = 1.0;
}

#endif
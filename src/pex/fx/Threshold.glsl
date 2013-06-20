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
uniform float threshold;

void main() {
  vec3 color = texture2D(tex0, vTexCoord).rgb;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  color = (luma > threshold) ? color : vec3(0.0);

  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}

#endif
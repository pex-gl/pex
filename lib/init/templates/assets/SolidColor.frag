#ifdef GL_ES
precision highp float;
#endif

uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}

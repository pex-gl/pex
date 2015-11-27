#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord0;
void main() {
  gl_FragColor = vec4(vTexCoord0, 0.0, 1.0);
}

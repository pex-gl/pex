#ifdef GL_ES
precision highp float;
#endif

varying vec3 ecNormal;

void main() {
    gl_FragColor = vec4(normalize(ecNormal) * 0.5 + 0.5, 1.0);
}

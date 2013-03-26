#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec4 color;
varying vec4 vColor;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vColor = color;
}

#endif

#ifdef FRAG

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}

#endif

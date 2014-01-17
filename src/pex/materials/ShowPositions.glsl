#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
varying vec4 vColor;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vColor = modelWorldMatrix * vec4(position, 1.0);
  vColor.a = (modelViewMatrix * vec4(position, 1.0)).z;
}

#endif

#ifdef FRAG

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}

#endif

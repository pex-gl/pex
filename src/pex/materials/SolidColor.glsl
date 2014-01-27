#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;
attribute vec3 position;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
}

#endif

#ifdef FRAG

uniform vec4 color;
uniform bool premultiplied;

void main() {
  gl_FragColor = color;
  if (premultiplied) {
    gl_FragColor.rgb *= color.a;
  }
}

#endif

#ifdef VERT

attribute vec4 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float near;
uniform float far;

varying float depth;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * position;

  //linear depth in camera space (0..far)
  depth = (modelViewMatrix * position).z/far;
}
#endif

#ifdef FRAG

uniform float near;
uniform float far;

varying float depth;

//from http://spidergl.org/example.php?id=6
vec4 packDepth(const in float depth) {
  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
  vec4 res = fract(depth * bit_shift);
  res -= res.xxyz * bit_mask;
  return res;
}

void main() {
  gl_FragColor = packDepth(-depth);
  gl_FragColor.r = 1.0;
}

#endif
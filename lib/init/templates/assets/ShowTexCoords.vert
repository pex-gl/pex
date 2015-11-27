attribute vec2 aTexCoord0;
attribute vec4 aPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
varying vec2 vTexCoord0;
void main() {
  vTexCoord0 = aTexCoord0;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
}

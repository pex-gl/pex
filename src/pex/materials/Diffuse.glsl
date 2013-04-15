#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
uniform vec3 lightPos;
attribute vec3 position;
attribute vec3 normal;
varying vec3 ecPosition;
varying vec3 ecLightPos;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vNormal = normal;

  vec3 wPos = (modelWorldMatrix * vec4(position, 1.0)).xyz;

  ecPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  ecLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
  vNormal = (viewMatrix * normalMatrix * vec4(normal, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
varying vec3 ecPosition;
varying vec3 ecLightPos;
varying vec3 vNormal;


void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(ecLightPos - ecPosition);
  float NdotL = max(0.0, dot(N, L));
  gl_FragColor.rgb = vec3(0.2 + NdotL);//ambientColor + NdotL * diffuseColor;
  gl_FragColor.a = 1.0;
}

#endif

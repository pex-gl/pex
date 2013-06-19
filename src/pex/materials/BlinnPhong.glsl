#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
uniform vec3 lightPos;
uniform vec3 cameraPos;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

void main() {
  vec4 worldPos = modelWorldMatrix * vec4(position, 1.0);
  vec4 eyePos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * eyePos;
  vEyePos = eyePos.xyz;
  gl_PointSize = pointSize;
  vNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;
uniform float shininess;
uniform float wrap;
uniform bool useBlinnPhong;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vEyePos;

float phong(vec3 L, vec3 E, vec3 N) {
  vec3 R = reflect(-L, N);
  return dot(R, E);
}

float blinnPhong(vec3 L, vec3 E, vec3 N) {
  vec3 halfVec = normalize(L + E);
  return dot(halfVec, N);
}

void main() {
  vec3 L = normalize(vLightPos - vEyePos); //lightDir
  vec3 E = normalize(-vEyePos); //viewDir
  vec3 N = normalize(vNormal); //normal

  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  vec4 color = ambientColor + NdotL * diffuseColor;

  float specular = 0;
  if (useBlinnPhong)
    specular = blinnPhong(L, E, N);
  else
    specular = phong(L, E, N);

  color += max(pow(specular, shininess), 0.0) * specularColor;

  gl_FragColor = color;
}

#endif

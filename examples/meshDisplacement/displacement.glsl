#ifdef VERT

// default attributes and uniforms from pex
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
attribute vec3 normal;
attribute vec3 position;

// attributes and uniforms from js
attribute float displacement;
uniform float amplitude;

// varyings for fragment shader
varying vec3 varNormal;
varying vec3 varVertexViewPos;

void main() {
	// calculate new position
	vec3 newPosition = position + normal * vec3(displacement * amplitude);

	// calculate varyings for normal and vertex view position
  varNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
	varVertexViewPos = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

#endif

#ifdef FRAG

// uniforms
uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;

// varyings from vertex shader
varying vec3 varNormal;
varying vec3 varVertexViewPos;

void main() {
  vec3 light = normalize(lightPos);

  // vec3 normal = normalize(varNormal);
	vec3 normal = normalize(cross(dFdx(varVertexViewPos), dFdy(varVertexViewPos)));

  gl_FragColor = ambientColor + clamp(dot(normal, light), 0.0, 1.0) * diffuseColor;
}

#endif

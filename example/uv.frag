#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265

uniform float time;
uniform vec2 resolution;

void main() {
  vec3 col = vec3( gl_FragCoord.xy / resolution, 0.0 );
  gl_FragColor = vec4(
    pow( col, vec3( 2.2 ) ),
    1.0
  );
}
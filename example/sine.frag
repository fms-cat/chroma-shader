#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265

uniform float time;

void main() {
  gl_FragColor = vec4( sin( vec3( 0.0, 2.0, 4.0 ) / 3.0 * PI + time ), 1.0 );
}
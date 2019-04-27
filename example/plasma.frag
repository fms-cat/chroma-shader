#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265

uniform float time;
uniform vec2 resolution;

void main() {
  vec2 p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.x;

  // https://www.bidouille.org/prog/plasma
  float a = sin( 4.0 * p.x - time );
  a += 1.4 * sin( 5.0 * ( p.x * sin( time * 0.5 ) + p.y * cos( time * 0.3 ) + time ) );
  a += 2.0 * sin( 3.0 * length( p + vec2( sin( time * 0.2 ), cos( time * 0.4 ) ) ) + time );

  vec3 col = 0.5 + 0.5 * sin( vec3( 0.0, 1.0, 2.0 ) / 3.0 * PI + a );
  gl_FragColor = vec4(
    pow( col, vec3( 2.2 ) ),
    1.0
  );
}
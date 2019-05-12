#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265
#define MODTIME 300.0
#define TRANSITION 5.0

uniform float time;
uniform vec2 resolution;

float plasmaField( vec2 p, float t ) {
  // https://www.bidouille.org/prog/plasma
  float field = sin( 4.0 * p.x - t );
  field += 1.4 * sin( 2.0 * ( p.x * sin( t * 0.5 ) + p.y * cos( t * 0.3 ) + t ) );
  field += 2.0 * sin( 3.0 * length( p + vec2( sin( t * 0.2 ), cos( t * 0.4 ) ) ) + t );
  return field;
}

void main() {
  vec2 p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.x;

  float field = mix(
    plasmaField( p, time ),
    plasmaField( p, time - MODTIME ),
    smoothstep( MODTIME - TRANSITION, MODTIME, time )
  );

  vec3 col = 0.5 + 0.5 * sin( vec3( 0.0, 1.0, 2.0 ) / 3.0 * PI + field );
  gl_FragColor = vec4(
    pow( col, vec3( 2.2 ) ),
    1.0
  );
}

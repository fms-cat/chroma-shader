const fs = require( 'fs' );
const path = require( 'path' );
const http = require( 'http' );
const querystring = require( 'querystring' );
const GLContext = require( 'gl' );
const { ChromaShader } = require( '../dist/index.js' );

// == various init =================================================================================
const gl = GLContext( ChromaShader.WIDTH, ChromaShader.HEIGHT );
const chromaShader = new ChromaShader( gl );
chromaShader.modtime = 300.0;

let onUpdate = () => {};

// == load / compile shader ========================================================================
function loadShader( frag ) {
  return chromaShader.compileShader( frag ); // returns error
}

// == init =========================================================================================
chromaShader.initSDK( {
  title: 'chroma-shader example app',
  description: 'yes chroma is my most favorite sound voltex',
  author: {
    name: 'FMS-Cat',
    contact: 'https://github.com/FMS-Cat/chroma-shader'
  }
} ).then( () => {
  console.log( chromaShader.getSDKURI() );
  onUpdate = () => chromaShader.render();
} );

const frag = fs.readFileSync(
  path.resolve( __dirname, './plasma.frag' ),
  { encoding: 'utf-8' }
);

const initError = loadShader( frag );
if ( initError ) {
  console.error( initError );
  process.exit( 1 );
}

// == update =======================================================================================
const update = () => {
  if ( !onUpdate ) { return; }
  onUpdate();
  setTimeout( update, 50 );
};
update();

// == server =======================================================================================
const server = http.createServer();

const html = `<!DOCTYPE html>
<body>
  <form action="/submit" method="post">
    <textarea name="frag" rows="10" cols="80" style="font-family: monospace;">#ifdef GL_ES
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
</textarea><br />
    <input type="submit" value="submit">
  </form>
</body>
`;

server.on( 'request', ( req, res ) => {
  if ( req.url === '/' && req.method === 'GET' ) {

    res.writeHead( 200, { 'Content-Type': 'text/html' } );
    res.end( html );

  } else if ( req.url === '/submit' && req.method === 'POST' ) {

    let data = '';

    req.on( 'readable', () => {
      data += req.read() || '';
    } );

    req.on( 'end', () => {
      const frag = querystring.parse( data ).frag;
      const error = loadShader( frag );

      if ( error ) {
        res.writeHead( 400 );
        res.end( error.toString() );
        return;
      }

      res.end( 'OK' );
    } );

  }
} );

const port = process.env.PORT || 8080;
server.listen( port );
console.info( 'Listening on port ' + port );

const fs = require( 'fs' );
const path = require( 'path' );
const GLContext = require( 'gl' );
const { ChromaShader } = require( '../dist/index.js' );

// == various init =================================================================================
const gl = GLContext( ChromaShader.WIDTH, ChromaShader.HEIGHT );
const chromaShader = new ChromaShader( gl );

let onUpdate = () => {};

// == load / compile fragment shader ===============================================================
const frag = fs.readFileSync(
  path.resolve( __dirname, './plasma.frag' ),
  { encoding: 'utf-8' }
);

const err = chromaShader.compileShader( frag );
if ( err ) {
  console.error( err );
  process.exit( 1 );
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

// == update =======================================================================================
const update = () => {
  if ( !onUpdate ) { return; }
  onUpdate();
  setTimeout( update, 50 );
};
update();

// == exit =========================================================================================
process.on( 'exit', async () => {
  if ( chromaShader.getSDKURI() !== null ) {
    await chromaShader.uninitSDK();
    onUpdate = null;
  }
} );
process.on( 'SIGINT', () => process.exit( 0 ) );

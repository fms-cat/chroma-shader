const GLContext = require( 'gl' );
const { ChromaShader } = require( '../dist/index.js' );

const gl = GLContext( 256, 256 );
const chromaShader = new ChromaShader( gl );

console.log( chromaShader );
const GLContext = require( 'gl' );
const { ChromaShader } = require( '../dist/index.js' );

const gl = GLContext( 256, 256 );
const chromaShader = new ChromaShader( gl );

chromaShader.init( {
  title: 'chroma-coder example app',
  description: 'yes chroma is my most favorite sound voltex',
  author: {
    name: 'FMS-Cat',
    contact: 'https://github.com/FMS-Cat'
  }
} ).then( () => {
  console.log( chromaShader.getURI() );
  chromaShader.uninit();
} );

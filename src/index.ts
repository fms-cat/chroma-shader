import { GLCat, GLCatBuffer } from '@fms-cat/glcat-ts';

export class ChromaShader {
  private __gl: WebGLRenderingContext;
  private __glCat: GLCat;
  private __vboQuad: GLCatBuffer;

  public constructor( gl: WebGLRenderingContext ) {
    this.__gl = gl;
    this.__glCat = new GLCat( this.__gl );
    this.__vboQuad = this.__glCat.createBuffer()!;
    this.__vboQuad.setVertexbuffer( new Float32Array( [ -1, -1, 1, -1, -1, 1, 1, 1 ] ) );
  }
}

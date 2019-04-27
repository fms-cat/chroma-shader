import { GLCat, GLCatBuffer } from '@fms-cat/glcat-ts';
import request from 'request';

export class ChromaShader {
  private __gl: WebGLRenderingContext;
  private __glCat: GLCat;
  private __vboQuad: GLCatBuffer;
  private __uri: string | null = null;

  public constructor( gl: WebGLRenderingContext ) {
    this.__gl = gl;
    this.__glCat = new GLCat( this.__gl );
    this.__vboQuad = this.__glCat.createBuffer()!;
    this.__vboQuad.setVertexbuffer( new Float32Array( [ -1, -1, 1, -1, -1, 1, 1, 1 ] ) );
  }

  /**
   * Initialize Chroma SDK.
   *
   * Ref: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_01_8init.html
  */
  public init( params: {
    title: string,
    description: string,
    author: {
      name: string,
      contact: string
    }
  } = {
    title: 'chroma-shader app',
    description: 'no description',
    author: {
      name: 'John Doe',
      contact: 'https://example.com'
    }
  } ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      const { title, description, author } = params;

      request( {
        method: 'POST',
        url: 'http://localhost:54235/razer/chromasdk',
        headers: { 'Content-type': 'application/json' },
        json: {
          title,
          description,
          author,
          device_supported: [ 'keyboard' ],
          category: 'application'
        }
      }, ( error, response, body ) => {
        if ( error ) { reject( error ); return; }

        this.__uri = body.uri;

        resolve();
      } );
    } );
  }

  /**
   * Uninitialize Chroma SDK.
   *
   * Ref: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_02_8uninit.html
   */
  public uninit(): Promise<void> {
    const url = this.__uri;
    if ( !url ) {
      return Promise.reject( 'The ChromaShader is not initialized.' );
    }

    return new Promise( ( resolve, reject ) => {
      request( {
        method: 'DELETE',
        url
      }, ( error, response, body ) => {
        if ( error ) { reject( error ); return; }

        this.__uri = null;
        resolve();
      } );
    } );
  }

  /**
   * Returns the API endpoint of current Chroma SDK session.
   */
  public getURI(): string | null { return this.__uri; }
}

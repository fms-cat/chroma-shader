import { GLCat, GLCatBuffer, GLCatProgram } from '@fms-cat/glcat-ts';
import request from 'request';

const vertQuad = `attribute vec2 p;
void main() {
  gl_Position = vec4( p, 0.0, 1.0 );
}
`;

export class ChromaShader {
  public static WIDTH = 22;
  public static HEIGHT = 6;

  private __gl: WebGLRenderingContext;
  private __glCat: GLCat;
  private __vboQuad: GLCatBuffer;
  private __program: GLCatProgram | null = null;
  private __uri: string | null = null;
  private __beginTime: number;
  private __pixelBuffer: Uint8Array;
  private __pixelBufferView: DataView;
  private __pixelParam: number[][];

  public constructor( gl: WebGLRenderingContext ) {
    this.__gl = gl;
    this.__glCat = new GLCat( this.__gl );
    this.__vboQuad = this.__glCat.createBuffer()!;
    this.__vboQuad.setVertexbuffer( new Float32Array( [ -1, -1, 1, -1, -1, 1, 1, 1 ] ) );
    this.__beginTime = Date.now();
    this.__pixelBuffer = new Uint8Array( 22 * 6 * 4 );
    this.__pixelBufferView = new DataView( this.__pixelBuffer.buffer );
    this.__pixelParam = [
      [], [], [], [], [], []
    ];
  }

  /**
   * Compile given shader. Returns error or `null`.
   */
  public compileShader( frag: string ): any {
    try {
      const newProgram = this.__glCat.lazyProgram( vertQuad, frag );

      if ( newProgram ) {
        const prevProgram = this.__program;
        this.__program = newProgram;

        if ( prevProgram ) {
          prevProgram.getShaders()!.forEach( ( shader ) => shader.dispose() );
          prevProgram.dispose();
        }

        this.__glCat.useProgram( this.__program );
      }
    } catch ( e ) {
      return e;
    }

    return null;
  }

  /**
   * Render.
   */
  public render(): void {
    const program = this.__program;
    if ( !program ) {
      console.error( 'The ChromaShader is not initialized.' );
      return;
    }

    const url = this.__uri;
    if ( !url ) {
      console.error( 'The ChromaShader is not initialized.' );
      return;
    }

    const now = Date.now();
    program.attribute( 'p', this.__vboQuad, 2 );
    program.uniform1f( 'time', 0.001 * ( now - this.__beginTime ) );
    program.uniform2f( 'resolution', ChromaShader.WIDTH, ChromaShader.HEIGHT );
    this.__gl.drawArrays( this.__gl.TRIANGLE_STRIP, 0, 4 );
    this.__gl.readPixels(
      0, // x
      0, // y
      22, // width
      6, // height
      this.__gl.RGBA, // format
      this.__gl.UNSIGNED_BYTE, // type
      this.__pixelBuffer // dst
    );

    for ( let i = 0; i < 6; i ++ ) {
      for ( let j = 0; j < 22; j ++ ) {
        const offset = 4 * ( 22 * ( 5 - i ) + j ) // y should be flipped
        this.__pixelParam[ i ][ j ] = this.__pixelBufferView.getUint32( offset, true ) & 16777215;
      }
    }

    request( {
      method: 'PUT',
      url: `${url}/keyboard`,
      headers: { 'Content-type': 'application/json' },
      json: {
        effect: 'CHROMA_CUSTOM',
        param: this.__pixelParam
      }
    }, ( error, response, body ) => {
      if ( error ) { console.error( error ); return; }
    } );
  }

  /**
   * Initialize Chroma SDK.
   *
   * Ref: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_01_8init.html
  */
  public initSDK( params: {
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
  public uninitSDK(): Promise<void> {
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
  public getSDKURI(): string | null { return this.__uri; }
}

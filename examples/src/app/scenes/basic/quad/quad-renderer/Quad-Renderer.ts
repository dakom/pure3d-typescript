import { WebGlRenderer, WebGlConstants,  createShader, activateShader} from "lib/Lib";
import { mat4 } from 'gl-matrix';
import vertexShader from "./Quad-Shader-Vertex.glsl";
import fragmentShader from "./Quad-Shader-Fragment.glsl";

export const SHADER_ID = Symbol("quad");
const BUFFER_ID = Symbol("quad");

export interface QuadElement {
    img:HTMLImageElement;
    texture: WebGLTexture;
    width: number;
    height: number;
    clipSpace:Float32Array;
}

export const createQuadRenderer = (renderer:WebGlRenderer) => {
    console.log("Setup quad renderer");
    
    const {gl, buffers} = renderer;
    const {shaderId, uniforms, program} = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});
 
    const activateAttributeData = (aName:string) =>
        renderer.attributes.activateData(renderer.attributes.getLocationInShader(program) (aName));

    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = uniforms.setters;
    
    const sizeMatrix = mat4.create();
    
    buffers.assign(BUFFER_ID) ({
        target: WebGlConstants.ARRAY_BUFFER,
        usagePattern: WebGlConstants.STATIC_DRAW,
        data: new Float32Array([
            0.0,1.0, // top-left
            0.0,0.0, //bottom-left
            1.0, 1.0, // top-right
            1.0, 0.0 // bottom-right
        ])
    });

    const activateVertexBuffer = () => activateAttributeData("a_Vertex") (BUFFER_ID) ({
        size: 2,
        type: gl.FLOAT
    });

    return (item:QuadElement) => {
        const {width, height,  texture, clipSpace, img} = item;
        
        if(!width || !height || !texture) {
            return;
        }

        //console.log(hitColor);

        activateShader(shaderId);
        
        //render data
        mat4.fromScaling(sizeMatrix, [width, height, 1]);

        
        //set uniform/attributes (color is set below based on interactive settings)

        uniformMatrix4fv("u_Size") (false) (sizeMatrix);
        uniformMatrix4fv("u_Transform") (false) (clipSpace);

        activateVertexBuffer();

        renderer.switchTexture(0) (texture);

        //console.log("sampling");

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        uniform1i("u_Sampler") (0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

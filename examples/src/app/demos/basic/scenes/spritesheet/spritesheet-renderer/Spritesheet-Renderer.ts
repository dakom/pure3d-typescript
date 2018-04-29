import { WebGlRenderer, WebGlConstants,  createShader, activateShader} from "lib/Lib";
import { mat4 } from 'gl-matrix';
import vertexShader from "./Spritesheet-Shader-Vertex.glsl";
import fragmentShader from "./Spritesheet-Shader-Fragment.glsl";

export const SHADER_ID = Symbol("spritesheet");
const BUFFER_ID = Symbol("spritesheet");

export interface SpriteSheetElement { 
    texture: WebGLTexture;
    width: number;
    height: number;
    uvOffset: Float32Array;
    uvScale: Float32Array;
    clipSpace:Float32Array;
}

export const createSpriteSheetRenderer = (renderer:WebGlRenderer) => {
    console.log("Setup quad renderer");
    
    const {gl, buffers} = renderer;
    const {shaderId, uniforms,attributes} = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});
 

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

    const activateVertexBuffer = () => attributes.activateData("a_Vertex") (BUFFER_ID) ({
        size: 2,
        type: gl.FLOAT
    });

    return (item:SpriteSheetElement) => {
        const {width, height,  texture, clipSpace, uvOffset, uvScale} = item;
        
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
        
        uniform1i("u_Sampler") (0);

        uniform2fv("u_uvOffset") (uvOffset);
        uniform2fv("u_uvScale") (uvScale); 

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
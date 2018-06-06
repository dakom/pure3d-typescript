import { WebGlRenderer, WebGlConstants,  createShader, activateShader} from "lib/Lib";
import { mat4 } from 'gl-matrix';
import vertexShader from "./Combined-Textures-Shader-Vertex.glsl";
import fragmentShader from "./Combined-Textures-Shader-Fragment.glsl";

export const SHADER_ID = Symbol("combined-textures");
const BUFFER_ID = Symbol("combined-textures");

export interface CombinedTexturesElement {
    imgTexture: WebGLTexture;
    noiseTexture:WebGLTexture;
    width: number;
    height: number;
    clipSpace:Float32Array;
}

export const createCombinedTexturesRenderer = (renderer:WebGlRenderer) => {
    console.log("Setup quad renderer");

    const {gl, buffers} = renderer;

    const {shaderId, uniforms, program} = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});

    activateShader(shaderId);
    
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

    return (item:CombinedTexturesElement) => {
        const {width, height,  imgTexture, noiseTexture, clipSpace} = item;
        
        if(!width || !height || !imgTexture || !noiseTexture) {
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

        renderer.switchTexture(0) (imgTexture);
        renderer.switchTexture(1) (noiseTexture);
        
        uniform1i("u_Sampler0") (0);
        uniform1i("u_Sampler1") (1);
       
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

import {
    WebGlConstants,
    WebGlRenderer,
    createShader,
    activateShader,
} from 'lib/Lib';
import { mat4 } from 'gl-matrix';
import {BoxElement} from "../Box-Element";
import {ELEMENTS_BUFFER_ID, GEOMETRY_BUFFER_ID, COLORS_BUFFER_ID, nElements} from "../Box-Data";
import vertexShader from "./Box-Vao-Shader-Vertex.glsl";
import fragmentShader from "./Box-Vao-Shader-Fragment.glsl";


export const SHADER_ID = Symbol("box-vao");

const VERTEX_ID = Symbol("box-vao");

export const createBoxVaoRenderer = (renderer:WebGlRenderer) => {
    console.log("Allocating vao box renderer");
    const sizeMatrix = mat4.create();

    const {gl, buffers} = renderer;
    const shader = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});

    const {shaderId, uniforms, program} = shader;


    

    activateShader(shaderId);


    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = uniforms.setters;
    
    renderer.vertexArrays.assign(VERTEX_ID) ({
      elementBufferId: ELEMENTS_BUFFER_ID,
      data: [
        {
            //See wiki and compare to "combo 1" example for per-renderer / global approach
            location: renderer.attributes.getLocationInShader (program) ("a_Vertex"),
            bufferId: GEOMETRY_BUFFER_ID,
            size: 3,
            type: gl.FLOAT
        },
        {
            location: renderer.attributes.getLocationInShader (program) ("a_Color"),
            bufferId: COLORS_BUFFER_ID,
            size: 3,
            type: gl.FLOAT
        }
      ]  
    });
        
    //This part is called every tick (or whenver render is triggered)
    return (item:BoxElement) => {
        const {width, height, depth, clipSpace} = item;
        
        if(!width || !height || !depth || !clipSpace) {
            console.error("missing data!");
            return;
        }

        activateShader(shaderId);
        
        renderer.glToggle(WebGlConstants.DEPTH_TEST) (true);
        
        mat4.fromScaling(sizeMatrix, [width, height, depth]);

        uniformMatrix4fv("u_Size") (false) (sizeMatrix);
        uniformMatrix4fv("u_Transform") (false) (clipSpace);

        renderer.vertexArrays.activate(VERTEX_ID);
        gl.drawElements(gl.TRIANGLES, nElements, gl.UNSIGNED_BYTE, 0);
    }
}

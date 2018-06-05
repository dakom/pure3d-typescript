import {
    WebGlConstants,
    WebGlRenderer,
    createShader,
    activateShader,
    createVertexArraysForShader,
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

    const {shaderId, uniforms } = shader;


    //See wiki and compare to "combo 1" example for per-renderer / global approach
    
    const vertexArrays = createVertexArraysForShader({renderer, shader});

    activateShader(shaderId);


    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = uniforms.setters;
    
    vertexArrays.assign(VERTEX_ID) ({
      elementBufferId: ELEMENTS_BUFFER_ID,
      data: [
        {
            attributeName: "a_Vertex",
            bufferId: GEOMETRY_BUFFER_ID,
            size: 3,
            type: gl.FLOAT
        },
        {
            attributeName: "a_Color",
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
        
        mat4.fromScaling(sizeMatrix, [width, height, depth]);

        uniformMatrix4fv("u_Size") (false) (sizeMatrix);
        uniformMatrix4fv("u_Transform") (false) (clipSpace);

        vertexArrays.activate(VERTEX_ID);
        gl.drawElements(gl.TRIANGLES, nElements, gl.UNSIGNED_BYTE, 0);
        vertexArrays.release();
    }
}

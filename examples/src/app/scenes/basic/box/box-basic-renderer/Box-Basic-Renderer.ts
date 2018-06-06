import {
    WebGlConstants,
    WebGlRenderer,
    createShader,
    activateShader
} from 'lib/Lib';
import { mat4 } from 'gl-matrix';
import {BoxElement} from "../Box-Element";
import {ELEMENTS_BUFFER_ID, GEOMETRY_BUFFER_ID, COLORS_BUFFER_ID, nElements} from "../Box-Data";
import vertexShader from "./Box-Basic-Shader-Vertex.glsl";
import fragmentShader from "./Box-Basic-Shader-Fragment.glsl";


export const SHADER_ID = Symbol("box-basic");


export const createBoxBasicRenderer = (renderer:WebGlRenderer) => {
    console.log("Allocating basic box renderer");
    const sizeMatrix = mat4.create();

    const {gl, buffers} = renderer;
    const {shaderId, uniforms, program} = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});


    activateShader(shaderId);

    const activateAttributeData = (aName:string) =>
        renderer.attributes.activateData(renderer.attributes.getLocationInShader(program) (aName));

    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = uniforms.setters;
    

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

        renderer.attributes.activateElements(ELEMENTS_BUFFER_ID);
        activateAttributeData("a_Vertex") (GEOMETRY_BUFFER_ID) ({
            size: 3,
            type: gl.FLOAT
        });
        activateAttributeData("a_Color") (COLORS_BUFFER_ID) ({
            size: 3,
            type: gl.FLOAT
        });

        
        gl.drawElements(gl.TRIANGLES, nElements, gl.UNSIGNED_BYTE, 0);
    }
}

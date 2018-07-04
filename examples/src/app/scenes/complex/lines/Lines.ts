import {
    WebGlRenderer,
    activateShader,
    createShader,
    Camera,
    createCubeTextureFromTarget,
    WebGlConstants,
    NumberArray
} from "lib/Lib"
import {mat4} from "gl-matrix";
import {parallel, Future} from "fluture";
import {fetchImage} from "fluture-loaders";
import vertexShader from "./Lines-Shader-Vertex.glsl";
import fragmentShader from "./Lines-Shader-Fragment.glsl";

export interface Line {
    p1: NumberArray;
    p2: NumberArray;
    color: NumberArray;
}

export const getBasisVector = (vector:NumberArray) => (color: NumberArray):Line => ({
    p1: [0,0,0],
    p2: vector,
    color
});

export const getAxes = (scale:number):Array<Line> => ([
    getBasisVector ([1 * scale,0,0]) ([1,0,0]),
    getBasisVector ([0,1 * scale,0]) ([0,1,0]),
    getBasisVector ([0,0,1 * scale]) ([0,0,1]),
]);

const VERTEX_BUFFER_ID = Symbol();

export const createLinesRenderer = (renderer:WebGlRenderer) => {
    const shaderId = Symbol();
    const {gl, buffers} = renderer;

    //This must come first here since we're also working with gltf
    //See wiki and compare to "basic vao" example for per-shader / automatic approach
    renderer.attributes.globalLocations.add("a_Position");
    renderer.attributes.globalLocations.add("a_Color");

    const shader = createShader({renderer, shaderId, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});

    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = shader.uniforms.setters;
    activateShader(shaderId);


    const updateVertexBuffers = (lines:Array<Line>) => {
        const data = new Float32Array(lines.length * 12);

        lines.forEach((line, index) => {
            const offset = index * 12;

            data[offset] = line.p1[0];
            data[offset+1] = line.p1[1];
            data[offset+2] = line.p1[2];

            data[offset+3] = line.color[0];
            data[offset+4] = line.color[1];
            data[offset+5] = line.color[2];
            
            data[offset+6] = line.p2[0];
            data[offset+7] = line.p2[1];
            data[offset+8] = line.p2[2];


            data[offset+9] = line.color[0];
            data[offset+10] = line.color[1];
            data[offset+11] = line.color[2];
        });

        const FSIZE = data.BYTES_PER_ELEMENT;
        const stride = FSIZE * 6;

        buffers.assign(VERTEX_BUFFER_ID) ({
            target: WebGlConstants.ARRAY_BUFFER,
            usagePattern: WebGlConstants.STATIC_DRAW,
            data
        });
       
        //since we're not using elements
        //gotta release current vao just in case elements are bound elsewhere
        renderer.vertexArrays.release();
        
        renderer.attributes.activateData
            (renderer.attributes.getLocationInRenderer ("a_Position")) 
            (VERTEX_BUFFER_ID)
            ({
                size: 3,
                stride,
                type: gl.FLOAT
            });
        
        renderer.attributes.activateData
            (renderer.attributes.getLocationInRenderer ("a_Color")) 
            (VERTEX_BUFFER_ID)
            ({
                size: 3,
                stride,
                offset: FSIZE * 3,
                type: gl.FLOAT
            });
    }

    const render = (camera:Camera) => (lines:Array<Line>) => {
        activateShader(shaderId);


        //renderer.glToggle(WebGlConstants.DEPTH_TEST) (true);
        //renderer.glToggle(WebGlConstants.CULL_FACE) (false);


        //TODO - First get to work, then replace with scene camera
        const cameraMatrix = mat4.multiply(mat4.create(), camera.projection, camera.view);
        uniformMatrix4fv("u_Transform") (false) (cameraMatrix);

        updateVertexBuffers(lines);

        gl.drawArrays(gl.LINES, 0, 2 * lines.length);
    }

    return render;
}

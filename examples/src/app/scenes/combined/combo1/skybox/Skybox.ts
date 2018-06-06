import {
    WebGlRenderer,
    activateShader,
    createShader,
    Camera,
    createCubeTextureFromTarget,
    WebGlConstants
} from "lib/Lib"
import {mat4} from "gl-matrix";
import { S } from "../../../../utils/Sanctuary";
import {parallel, Future} from "fluture";
import {fetchImage} from "fluture-loaders";
import {ELEMENTS_BUFFER_ID, uploadData, GEOMETRY_BUFFER_ID, COLORS_BUFFER_ID, nElements} from "./Skybox-Data";
import vertexShader from "./Skybox-Shader-Vertex.glsl";
import fragmentShader from "./Skybox-Shader-Fragment.glsl";


const urls = [
    "static/world/environment/environment_right_0.jpg",
    "static/world/environment/environment_left_0.jpg",
    "static/world/environment/environment_top_0.jpg",
    "static/world/environment/environment_bottom_0.jpg",
    "static/world/environment/environment_front_0.jpg",
    "static/world/environment/environment_back_0.jpg"
];

const loadSkybox = (renderer:WebGlRenderer) => 
    parallel(Infinity, urls.map(fetchImage))
        .map(imgElements => 
            createCubeTextureFromTarget({
                gl: renderer.gl,
                format: WebGlConstants.RGB, 
                setParameters: opts => {
                    renderer.gl.pixelStorei(WebGlConstants.UNPACK_FLIP_Y_WEBGL, false);
                    renderer.gl.texParameteri(WebGlConstants.TEXTURE_CUBE_MAP, WebGlConstants.TEXTURE_WRAP_S, WebGlConstants.CLAMP_TO_EDGE);
                    renderer.gl.texParameteri(WebGlConstants.TEXTURE_CUBE_MAP, WebGlConstants.TEXTURE_WRAP_T, WebGlConstants.CLAMP_TO_EDGE);
                    renderer.gl.texParameteri(WebGlConstants.TEXTURE_CUBE_MAP, WebGlConstants.TEXTURE_MIN_FILTER, WebGlConstants.LINEAR);
                    renderer.gl.texParameteri(WebGlConstants.TEXTURE_CUBE_MAP, WebGlConstants.TEXTURE_MAG_FILTER, WebGlConstants.LINEAR);
                }
            }) 
            ({
                posX: imgElements[0], 
                posY: imgElements[1],
                posZ: imgElements[2],
                negX: imgElements[3],
                negY: imgElements[4],
                negZ: imgElements[5],
            })
        )

export const createSkybox = (renderer:WebGlRenderer) =>
    loadSkybox(renderer)
        .map(texture => { 


            const shaderId = Symbol();
            const vaoId = Symbol();
            const sizeMatrix = mat4.fromScaling(mat4.create(), [1, 1, 1]);
            const {gl, buffers} = renderer;

            //This must come first here since we're also working with gltf
            //See wiki and compare to "basic vao" example for per-shader / automatic approach
            renderer.attributes.globalLocations.add("a_Vertex");
            renderer.attributes.globalLocations.add("a_Color");
            
            uploadData(renderer);
            
            const shader = createShader({renderer, shaderId, source: {
                vertex: vertexShader,
                fragment: fragmentShader
            }});



            const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = shader.uniforms.setters;
            activateShader(shaderId);


            renderer.vertexArrays.assign(vaoId) ({
                elementBufferId: ELEMENTS_BUFFER_ID,
                data: [
                    {
                        location: renderer.attributes.getLocationInRenderer("a_Vertex"),
                        bufferId: GEOMETRY_BUFFER_ID,
                        size: 3,
                        type: gl.FLOAT,
                        normalized: false,
                        stride: 0,
                        offset: 0
                    },
                    {
                        location: renderer.attributes.getLocationInRenderer("a_Color"),
                        bufferId: COLORS_BUFFER_ID,
                        size: 3,
                        type: gl.FLOAT,
                        normalized: false,
                        stride: 0,
                        offset: 0
                    }
                ]  
            });



            const render = (camera:Camera) => (frameTs:number) => {
                activateShader(shaderId);


                renderer.glToggle(WebGlConstants.DEPTH_TEST) (true);
                renderer.glToggle(WebGlConstants.CULL_FACE) (true);

                uniformMatrix4fv("u_Size") (false) (sizeMatrix);

                //TODO - First get to work, then replace with scene camera
                const cameraMatrix = mat4.multiply(mat4.create(), camera.projection, camera.view);
                uniformMatrix4fv("u_Transform") (false) (cameraMatrix);

                renderer.vertexArrays.activate(vaoId);
                gl.drawElements(gl.TRIANGLES, nElements, gl.UNSIGNED_BYTE, 0);
                renderer.vertexArrays.release();
            }

            return render;
        });

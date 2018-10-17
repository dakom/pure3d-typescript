import {
    GltfScene, 
    GLTF_ORIGINAL,
    GltfLightsExtensionName,
    GltfIblExtensionName,
    gltf_updateNodeTransforms,
    Camera,
    GltfNode,
    NodeKind, LightKind,
    gltf_createAnimator,
    GltfNodeKind,
    GltfBridge,
    gltf_load, 
    WebGlConstants,
    NumberArray,
    WebGlRenderer,
    getOrthographicProjection,
    getPerspectiveProjection,
    CameraKind,
    createMat4,
    createTransform,
    GltfLightNode,
    gltf_updateScene,
    getCameraFromNodeAndCanvas
} from "lib/Lib";
import {ModelInfo, Model, getModel} from "../../../gltf/Gltf-Models";
import {updateCamera, getInitialBasicCamera} from "../../../../utils/Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "../../../../utils/Sanctuary";
import {addGltfExtensions} from "../../../../utils/Gltf-Mixin";
import {createSkybox} from "../../skybox/Skybox";
import {createLinesRenderer, getAxes} from "../../lines/Lines";
import {mat4} from "gl-matrix";
import { getOrGenerateShader } from "../../../../../../../src/lib/internal/gltf/shaders/Gltf-Runtime-Shader";

const getSceneRenderer = 
    (useBuiltinCamera:boolean) => 
    (addLight:boolean) =>
    (renderer:WebGlRenderer) => 
    (path:string) =>  {

    return gltf_load({
        renderer, 
        path,
        config: { },
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .then(bridge => {

        let scene:GltfScene;

        const updateScene = gltf_updateScene(
            gltf_createAnimator(bridge.getData().animations) ({loop: true})
        );

        const cameraNode = bridge.getCameraNode(0);

        const render = (_camera:Camera) => (frameTs:number) => {
                const camera = cameraNode && useBuiltinCamera
                    ? getCameraFromNodeAndCanvas(cameraNode) (renderer.canvas)
                    : _camera;

                if(!scene) {
                    scene = bridge.getOriginalScene(camera) (0);

                    if (addLight) {
                        const light: GltfLightNode = {
                            kind: NodeKind.LIGHT,
                            light: {
                                kind: LightKind.Point,
                                color: [1, 0, 0],
                                intensity: 100
                            },
                            transform: createTransform(null)({
                                translation: [3, 3, 3]
                            })
                        }

                        scene.nodes.push(light);
                    }
                }

                scene = updateScene(frameTs) (Object.assign({}, scene, {camera}));
                bridge.renderScene(scene);
        }

        return (render);
    });
}

export const startLightingTest = 
        (renderer:WebGlRenderer) => 
        ({basicPath, gltfPath}:{basicPath: string, gltfPath: string}) => 
        (cameraType: "builtin" | "ortho" | "perspective") => 
        (addLight:boolean) => 
        (filePath:string) => {
        const axes = getAxes (5);

        
        const projection = 
            cameraType === "perspective"
                ?   getPerspectiveProjection({
                        yfov: 45.0 * Math.PI / 180,
                        aspectRatio: renderer.canvas.clientWidth / renderer.canvas.clientHeight,
                        znear: .01,
                        zfar: 1000
                    })
                :   getOrthographicProjection({
                        xmag: 15,
                        ymag: 15,
                        znear: 0.01,
                        zfar: 100
                    });

        const view = createMat4();
       
        if(cameraType === "perspective") {
            mat4.lookAt(view, [3,2,7], [0,0,0], [0,1,0]);
        } else {

            mat4.lookAt(view, [0,7,7], [0,0,0], [0,1,0]);
        }

        const camera = {projection, view}
        return createSkybox(renderer)
            .then(renderSkybox => ({
                renderSkybox,
                renderLines: createLinesRenderer(renderer)
            }))
            .then(renderers => 
                getSceneRenderer (cameraType === "builtin") (addLight) (renderer) (filePath)
                    .then(renderScene => Object.assign({}, renderers, {renderScene}))
            )
            .then(({renderSkybox, renderLines, renderScene}) => {

                return [
                    (frameTs:number) => {

                        //camera = updateCamera ({ isControlled: true, controls, cameraNode: undefined }) (camera); 

                        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
                        //renderers.map(render => render (camera) (frameTs));
                        //
            
                        //renderSkybox (camera);
                        renderLines (camera) (axes);
                        renderScene (camera) (frameTs);

                    },
                    () => {
                    }
                ]

            })
}
    

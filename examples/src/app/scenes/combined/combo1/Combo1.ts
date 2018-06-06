import {
    GltfScene, 
    GLTF_ORIGINAL,
    GltfLightsExtensionName,
    GltfIblExtensionName,
    gltf_updateNodeTransforms,
    Camera,
    GltfNode,
    gltf_findNodeById,
    gltf_createAnimator,
    GltfNodeKind,
    GltfBridge,
    gltf_load, 
    WebGlConstants,
    NumberArray,
    WebGlRenderer} from "lib/Lib";
import {Future} from "fluture";
import {ModelInfo, Model, getModel} from "../../gltf/Gltf-Models";
import {updateCamera, getInitialBasicCamera} from "../../../utils/Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "../../../utils/Sanctuary";
import {addGltfExtensions} from "../../../utils/Gltf-Mixin";
import {createSkybox} from "./skybox/Skybox";
import * as createControls from "orbit-controls";


const getCameraList = (gltf:GLTF_ORIGINAL) => {

    if(!gltf.cameras || !gltf.cameras.length) {
        return []
    }

    return gltf.cameras.map((camera, idx) => {
        let str = idx.toString();
        if(camera.name) {
            str += " " + camera.name;
        }
        return str;
    });
}

const _getBridge = ({renderer, menuOptions, gltfPath, modelName, translate}:
    {renderer:WebGlRenderer, menuOptions:any, gltfPath:string, modelName:string, translate: NumberArray}) => {

    const modelInfo = getModel(modelName); 
    return gltf_load({
        renderer, 
        path: gltfPath + modelInfo.url,
        config: { },
        mapper: addGltfExtensions ({model: modelInfo.model, menuOptions})
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .map(bridge => {

        let scene:GltfScene;

        const animate = gltf_createAnimator(bridge.getData().animations) ({loop: true});

        const render = (camera:Camera) => (frameTs:number) => {
                if(!scene) {
                    scene = bridge.getOriginalScene(camera) (0);
                    scene.nodes[0].transform.trs.translation = translate
                }
                scene = bridge.updateShaderConfigs(scene);
                
               
                const nodes = animate (frameTs) (scene.nodes)
                 scene = Object.assign({}, scene, {
                    camera,
                    nodes: 
                        gltf_updateNodeTransforms ({
                            updateLocal: true,
                            updateModel: true,
                            updateView: true,
                            camera: camera
                        })
                        (nodes)
                });

                bridge.renderScene(scene);
        }

        return (render);
    });
}

export const startCombo1 = (renderer:WebGlRenderer) => ({basicPath, gltfPath, menuOptions}:{basicPath: string, gltfPath: string, menuOptions: any}) => {
        const cameraPosition = [0,0,4];
        const cameraLook = [0,0,0];
        let camera = getInitialBasicCamera({position: cameraPosition, cameraLook: [0,0,0]});
        camera.zfar = 1000;
        const controls = createControls({
            position: cameraPosition, 
            target: cameraLook 
        });

        return (createSkybox(renderer) as Future<any, (camera:Camera) => (frameTs:number) => void>)
            .map(render => ([render]))
            .chain(xs =>
                _getBridge({
                    translate: [0,0,0],
                    renderer,
                    menuOptions,
                    gltfPath,
                    modelName: "DAMAGED_HELMET_BINARY",
                })
                .map(render => xs.concat([render]))
            )
            .chain(xs => 
                _getBridge({
                    translate: [0,0,1],
                    renderer,
                    menuOptions,
                    gltfPath,
                    modelName: "CESIUM_MAN_BINARY",
                })
                .map(render => xs.concat([render])) 
            )
            .map(renderers => {
                controls.enable();

                return [
                    (frameTs:number) => {

                        camera = updateCamera ({ isControlled: true, controls, cameraNode: undefined }) (camera); 

                        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
                        renderers
                            //.filter((fn, idx) => idx) //skip skybox
                            //.filter((fn, idx) => !idx) //skip models
                            .forEach(render => 
                                render (camera) (frameTs)
                            );
                        
                    },
                    () => {
                        controls.disable(); 
                    }
                ]

            })
}
    

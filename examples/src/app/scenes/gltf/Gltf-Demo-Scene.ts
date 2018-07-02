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
    WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {updateCamera, getInitialGltfCamera} from "../../utils/Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "../../utils/Sanctuary";

import {addGltfExtensions} from "../../utils/Gltf-Mixin";


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

export const startGltf = (renderer:WebGlRenderer) => ({modelPath, modelInfo, menuOptions}:{modelPath:string, modelInfo:ModelInfo, menuOptions: any}) => 
    gltf_load({
        renderer, 
        path: modelPath, 
        config: { },
        mapper: addGltfExtensions (menuOptions) (modelInfo.model) 
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .map(bridge => {

        const cameras = getCameraList(bridge.getData().original);
        if(cameras.sort().toString() !== menuOptions.cameras.sort().toString()) {
            menuOptions.onChange(Object.assign({}, menuOptions, {cameras}));
            return () => {};
        }

        const animate = gltf_createAnimator(bridge.getData().animations) ({loop: true});


        const {camera, cameraNodeId, controls, isControlled} = 
            getInitialGltfCamera (bridge) (modelInfo.model) (menuOptions.selectedCamera)

        let scene = bridge.getOriginalScene(camera) (0);

        if(controls) {
            controls.enable();
        }
       

        return [
            (frameTs:number) => {

                scene = bridge.updateShaderConfigs(scene);
                const nodes = animate (frameTs) (scene.nodes)

                const cameraNode = 
                    ((!isControlled)
                        ?   gltf_findNodeById (cameraNodeId) (nodes)
                        :   undefined) as any;
                
                scene = Object.assign({}, scene, {
                    camera:  updateCamera 
                                ({
                                    isControlled,
                                    controls,
                                    cameraNode
                                })
                                (scene.camera), 
                    nodes: gltf_updateNodeTransforms ({
                        updateLocal: true,
                        updateModel: true,
                        updateView: true,
                        camera: scene.camera
                    })
                    (nodes)
                });

                bridge.renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
                bridge.renderScene(scene);
            },
            () => {
                if(controls) {
                    controls.disable(); 
                }
                console.log("cleanup!");
            }
        ]
    });

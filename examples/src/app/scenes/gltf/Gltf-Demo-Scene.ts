import {
    GltfScene, 
    GLTF_ORIGINAL,
    GltfLightsExtensionName,
    GltfIblExtensionName,
    gltf_updateNodeTransforms,
    Camera,
    GltfNode,
    gltf_findNodeByOriginalId,
    gltf_createAnimator,
    GltfNodeKind,
    GltfBridge,
    gltf_load, 
    WebGlConstants,
    WebGlRenderer,
    gltf_updateAnimatedScene
} from "lib/Lib";
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

export const startGltf = (renderer:WebGlRenderer) => ({onMenuChange, modelPath, modelInfo, menuOptions}:{modelPath:string, modelInfo:ModelInfo, menuOptions: any, onMenuChange: any}) => 
    gltf_load({
        renderer, 
        path: modelPath, 
        config: { },
        mapper: addGltfExtensions (menuOptions) (modelInfo.model) 
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .then(bridge => {

        const cameras = getCameraList(bridge.getData().original);
        if(cameras.sort().toString() !== menuOptions.cameras.sort().toString()) {
            onMenuChange(Object.assign({}, 
                {
                    gltf: Object.assign({}, menuOptions, {cameras})
                }
            ));
            return () => {};
        }

        const updateScene = gltf_updateAnimatedScene(
            gltf_createAnimator(bridge.getData().animations) ({loop: true})
        );


        const {camera, cameraNodeId, controls, isControlled} = 
            getInitialGltfCamera (bridge) (modelInfo.model) (menuOptions.selectedCamera)

        let scene = bridge.getOriginalScene(camera) (0);

        if(controls) {
            controls.enable();
        }
       

        return [
            (frameTs:number) => {


                const cameraNode = 
                    ((!isControlled)
                        ?   gltf_findNodeByOriginalId (cameraNodeId) (scene.nodes)
                        :   undefined) as any;
                
                scene = updateScene (frameTs) (
                    Object.assign({}, scene, {
                        camera:  updateCamera 
                                (bridge.renderer)
                                ({
                                    isControlled,
                                    controls,
                                    cameraNode
                                })
                                (scene.camera)
                    })
                );

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

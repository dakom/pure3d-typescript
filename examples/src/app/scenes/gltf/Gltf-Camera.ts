
import {GltfScene, updateNodeListTransforms, PositionCamera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {mat4, vec3} from "gl-matrix";
import {getCameraLook} from "utils/Camera";
import {ModelInfo, Model} from "./Gltf-Models";
import {PointerEventStatus, PointerScreenEventData} from "input-senders";
import * as createControls from "orbit-controls";

export const updateCamera = (controls:any) => (camera:PositionCamera):PositionCamera => {
    controls.update();

    return getCameraLook([controls.position, controls.direction]);
}

export const getInitialCamera = (bridge:GltfBridge) => (model:Model) => {
        let camera:PositionCamera;
        let lookAt = Float64Array.from([0,0,0]);
        const isCameraIndex = model.cameraIndex !== undefined ? true : false;

        if(isCameraIndex) {
            camera = bridge.getOriginalCameras()[model.cameraIndex];
            
        } else {
            const position = model.cameraPosition !== undefined ? model.cameraPosition : Float64Array.from([0,0,4]);
            if(model.cameraLookAt !== undefined) {
                lookAt = model.cameraLookAt;
            }
            camera = getCameraLook([position, lookAt]);
        }


        const controls = createControls({
            position: camera.position,
            target: lookAt 
        });

        return {camera, controls}
}



import {GltfScene, updateNodeListTransforms, PositionCamera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {mat4, vec3} from "gl-matrix";
import {getCameraLook} from "utils/Camera";
import {ModelInfo, Model} from "./Gltf-Models";
import {PointerEventStatus, PointerScreenEventData} from "input-senders";

export const getInitialCamera = (bridge:GltfBridge) => (model:Model):PositionCamera => {
        if(model.cameraIndex !== undefined) {
            return bridge.getOriginalCameras()[model.cameraIndex];
        } else {
            const position = model.cameraPosition !== undefined ? model.cameraPosition : Float64Array.from([0,0,4]);
            const lookAt = model.cameraLookAt !== undefined ? model.cameraLookAt : Float64Array.from([0,0,0]);
            return getCameraLook([position, lookAt]);
        }
}


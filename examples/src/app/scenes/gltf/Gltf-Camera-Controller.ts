
import {OrbitCamera, updateOrbitCamera, GltfScene, updateNodeListTransforms, Camera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {mat4, vec3} from "gl-matrix";
import {getCameraLook, getCameraOrbit, getCameraOrbitPosition} from "utils/Camera";
import {ModelInfo, Model} from "./Gltf-Models";
import {PointerEventStatus, PointerScreenEventData} from "input-senders";
import {createOrbitCamera} from "lib/Lib";

export const getInitialCamera = (bridge:GltfBridge) => (model:Model) => {
    let cameraPosition: Float64Array;
        let camera:Camera;
        if(model.cameraIndex !== undefined) {
            const cameraNode = bridge.allNodes.filter(node => node.kind === GltfNodeKind.CAMERA)[model.cameraIndex];
            if(cameraNode.kind === GltfNodeKind.CAMERA) {
                camera = cameraNode.camera;
                cameraPosition = mat4.getTranslation(vec3.create(), cameraNode.transform.localMatrix); 
            }

        } else if(model.cameraPosition !== undefined) {
            cameraPosition = model.cameraPosition !== undefined ? model.cameraPosition : Float64Array.from([0,0,4]);
            camera = getCameraLook([
                cameraPosition, 
                model.cameraLookAt !== undefined ? model.cameraLookAt : Float64Array.from([0,0,0]),
            ])
        } else {
            const initOrbit = {yaw: 0, pitch: 0, roll: 0, translate: 4};
            camera = getCameraOrbit(initOrbit);
            cameraPosition = getCameraOrbitPosition(initOrbit);
        }
    return createOrbitCamera(Object.assign({}, camera, {position: cameraPosition}));
}

const _inputStatus: {
    active: boolean;
    initial: PointerScreenEventData;
    move: PointerScreenEventData;
} = {
    active: false,
    initial: null,
    move: null
}

export const cameraUpdateStart = (evt:PointerScreenEventData) => (scene:GltfScene):GltfScene => {
    const camera = scene.camera as OrbitCamera; 


    _inputStatus.active = true;
    _inputStatus.initial = evt;
    return scene;
}

export const cameraUpdateMove = (evt:PointerScreenEventData) => (scene:GltfScene):GltfScene => {
    if(_inputStatus.active) {
        _inputStatus.move = evt;
        scene = Object.assign({}, scene, {camera: updateOrbitCamera(scene.camera as OrbitCamera)}); 

    }
    return scene;
}

export const cameraUpdateEnd = (evt:PointerScreenEventData) => (scene:GltfScene):GltfScene => {
    _inputStatus.active = false;
    return scene;
}

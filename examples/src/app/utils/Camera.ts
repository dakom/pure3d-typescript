
import {getCameraProjection,
    PerspectiveCameraSettings,
    OrthographicCameraSettings,
    PerspectiveCamera,
    GltfScene,
    CameraKind,
    NumberArray,
    createMat4,
    createVec3,
    updateNodeListTransforms,
    Camera,
    GltfNodeKind,
    GltfBridge,
    WebGlConstants,
    WebGlRenderer} from "lib/Lib";
import {mat4, vec3} from "gl-matrix";
import {PointerEventStatus, PointerScreenEventData} from "input-senders";
import * as createControls from "orbit-controls";
import {Model} from "../scenes/gltf/Gltf-Models";

const cameraUp = Float64Array.from([0,1,0]);

export const updateCamera = (controls:any) => (camera:Camera):Camera => {
    controls.update();

    const view = mat4.lookAt(createMat4(), controls.position, controls.direction, controls.up);
    

    return Object.assign({}, camera, {position: controls.position, view});
}

export const getInitialBasicCamera = ({position, cameraLook}:{position: NumberArray, cameraLook: NumberArray}):Camera => {
    const settings:PerspectiveCameraSettings = {
        kind: CameraKind.PERSPECTIVE,
        yfov: 45.0 * Math.PI / 180,
        aspectRatio: window.innerWidth / window.innerHeight,
        znear: .01,
        zfar: 100
    }


    const projection = getCameraProjection(settings); 

    const view = mat4.lookAt(createMat4(), position, cameraLook,cameraUp);

    return {
        ...settings,
        position,
        view,
        projection
    }

}

export const getInitialGltfCamera = (bridge:GltfBridge) => (model:Model) => {
        const isCameraIndex = model.cameraIndex !== undefined ? true : false;

        if(isCameraIndex) {
            const camera = bridge.getOriginalCameras()[model.cameraIndex];
            const cameraLook = [0,0,0]; //might be nice to derive this

            const controls = createControls({
                position: camera.position,
                target: cameraLook
            });
            return {camera, controls}
        } else {
            const position = model.cameraPosition !== undefined ? model.cameraPosition : Float64Array.from([0,0,4]);

            const cameraLook = model.cameraLookAt
                ?   model.cameraLookAt
                :   Float64Array.from([0,0,0]);

           

            const camera = getInitialBasicCamera({position, cameraLook});
            const controls = createControls({
                position, 
                target: cameraLook 
            });
           

            //console.log( createControls({position: [4,4,4]}).position[0]);

            //console.log(position, controls.position);
            
            return {camera, controls}
        }
}



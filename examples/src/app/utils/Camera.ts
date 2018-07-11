
import {getCameraProjection,
    OrthographicCameraSettings,
    PerspectiveCameraSettings,
    GltfScene,
    CameraKind,
    NumberArray,
    createMat4,
    createVec3,
    Camera,
    GltfNodeKind,
    GltfBridge,
    GltfCameraNode,
    WebGlConstants,
    WebGlRenderer,
    setCameraPositionFromTransform,
    setCameraViewFromTransform,
    setCameraProjectionFromSettings
} from "lib/Lib";
import {mat4, vec3} from "gl-matrix";
import {PointerEventStatus, PointerScreenEventData} from "input-senders";
import * as createControls from "orbit-controls";
import {Model} from "../scenes/gltf/Gltf-Models";

const cameraUp = Float64Array.from([0,1,0]);


export const updateCamera = (renderer:WebGlRenderer) => ({isControlled, controls, cameraNode}:{controls: any, cameraNode: GltfCameraNode, isControlled: boolean}) => (camera:Camera):Camera => {

    if(isControlled) {
        controls.update();

        const view = mat4.lookAt(createMat4(), controls.position, controls.direction, controls.up);

        return Object.assign({}, camera, {position: controls.position, view });
    } else {
        return (
            setCameraPositionFromTransform(cameraNode.transform) (
                setCameraViewFromTransform (cameraNode.transform) (
                    setCameraProjectionFromSettings (Object.assign({}, camera.settings, {canvas: renderer.canvas})) (
                        camera
                    )
                )
            )
        );
    }
}

export const getInitialBasicCamera = ({position, cameraLook}:{position: NumberArray, cameraLook: NumberArray}):Camera => {
    const settings:PerspectiveCameraSettings = {
        kind: CameraKind.PERSPECTIVE,
        yfov: 45.0 * Math.PI / 180,
        aspectRatio: window.innerWidth / window.innerHeight,
        znear: .01,
        zfar: 1000
    }


    const projection = getCameraProjection(settings); 

    const view = mat4.lookAt(createMat4(), position, cameraLook,cameraUp);

    return {
        settings,
        position,
        view,
        projection
    }

}

export const getInitialGltfCamera = (bridge:GltfBridge) => (model:Model) => (cameraIndex:number) => {

    const cameraNode = bridge.getCameraNode(cameraIndex);

    if(cameraNode) {
        return {
            camera: cameraNode.camera,
            cameraNodeId: cameraNode.originalNodeId,
            isControlled: false
        }
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

        return {camera, controls, isControlled: true}
    }


}



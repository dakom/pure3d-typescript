import { CameraKind, NumberArray, GLTF_ORIGINAL, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_Camera, GLTF_ORIGINAL_CameraPerspective, GLTF_ORIGINAL_CameraOrthographic, Camera } from '../../../Types';
import {mat4, vec3} from "gl-matrix";
import {createVec3, createMat4} from "../../../exports/common/array/Array";
import {getCameraView, getPerspectiveProjection, getOrthographicProjection} from "../../../exports/common/camera/Camera";

export const GLTF_PARSE_getCamera = (originalCamera:GLTF_ORIGINAL_Camera) => (modelMatrix:NumberArray) => {
    const kind = originalCamera.type === "perspective"
        ?   CameraKind.PERSPECTIVE
        :   CameraKind.ORTHOGRAPHIC;

    const view = getCameraView(modelMatrix);
    
    console.error("CONTINUE FROM HERE");
    /*
    const projection = 
        ? getPerspectiveProjection(originalCamera.perspective) 
        : getOrthographicProjection(originalCamera.orthographic);

    return {
        view,
        projection
    }
    */
}

export const GLTF_PARSE_hasCameras = (original:GLTF_ORIGINAL):boolean => 
    (original.cameras && original.cameras.length > 0);


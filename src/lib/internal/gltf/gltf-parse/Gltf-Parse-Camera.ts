import { CameraKind, NumberArray, CameraSettings, GLTF_ORIGINAL, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_Camera, GLTF_ORIGINAL_CameraPerspective, GLTF_ORIGINAL_CameraOrthographic, Camera } from '../../../Types';
import {mat4, vec3} from "gl-matrix";
import {createVec3, createMat4} from "../../../exports/common/array/Array";
import {getCameraView, getCameraProjection} from "../../../exports/common/camera/Camera";

export const GLTF_PARSE_getCamera = (originalCamera:GLTF_ORIGINAL_Camera) => {

    return  originalCamera.type === "orthographic"
        ?   {
                kind:   CameraKind.ORTHOGRAPHIC,
                xmag:   originalCamera.orthographic.xmag,
                ymag:   originalCamera.orthographic.ymag,
                znear:  originalCamera.orthographic.znear,
                zfar:   originalCamera.orthographic.zfar
            }
        :   {
                kind: CameraKind.PERSPECTIVE,
                aspectRatio: originalCamera.perspective.aspectRatio,
                yfov: originalCamera.perspective.yfov,
                znear: originalCamera.perspective.znear,
                zfar: originalCamera.perspective.zfar,
            }



}

export const GLTF_PARSE_hasCameras = (original:GLTF_ORIGINAL):boolean => 
    (original.cameras && original.cameras.length > 0);


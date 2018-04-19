import { GLTF_ORIGINAL, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_Camera, GLTF_ORIGINAL_CameraPerspective, GLTF_ORIGINAL_CameraOrthographic, GltfCamera } from '../../Types';
import {GLTF_PARSE_getNodeTransformValues} from "./Gltf-Parse-Nodes";
import {getWorldTransformMatrix} from "../../exports/Transforms";
import {mat4, vec3} from "gl-matrix";

const getOrthographicProjection = (cam:GLTF_ORIGINAL_CameraOrthographic) => {
    const values = new Array<number>(16).fill(0);
    const r = cam.xmag;
    const t = cam.ymag;
    const f = cam.zfar;
    const n = cam.znear;

    values[0] = 1/r;
    values[5] = 1/t;
    values[10] = 2/(n - f);
    values[14] = (f+n) / (n-f);
    values[15] = 1;

    return values; 
}

const getPerspectiveProjection = (cam:GLTF_ORIGINAL_CameraPerspective) => {
    const values = new Array<number>(16).fill(0);
    const a = cam.aspectRatio;
    const y = cam.yfov;
    const n = cam.znear;
    const f = cam.zfar; //if this is undefined, use infinite projection

    values[0] = 1/(a * Math.tan(.5 * y));
    values[5] = 1/(Math.tan(.5 * y));
    values[10] = f === undefined ? -1 : (f+n)/(n-f);
    values[11] = -1;
    values[14] = f === undefined ? (-2 * n) : (2 * f * n)/(n - f);


    return values; 
}
export const GLTF_PARSE_getCamera = (original:GLTF_ORIGINAL) => (cameraIndex:number):GltfCamera => {
    const originalCamera:GLTF_ORIGINAL_Camera = original.cameras[cameraIndex];
    const cameraNode:GLTF_ORIGINAL_Node = original.nodes.find(node => node.camera === cameraIndex);

    const cameraNodeParent = null; //TODO 
    const cameraTransformValues = GLTF_PARSE_getNodeTransformValues(cameraNode);
    const cameraTransformMatrix = getWorldTransformMatrix(cameraTransformValues) (cameraNodeParent);

    const view = mat4.invert(mat4.create(),cameraTransformMatrix); 

    const projection = originalCamera.type === "perspective" 
        ? getPerspectiveProjection(originalCamera.perspective) 
        : getOrthographicProjection(originalCamera.orthographic) as Array<number>;


    const position = mat4.getTranslation(vec3.create(), cameraTransformMatrix) as Float32Array; //not really tested yet - only affects fragment shader

    return {
        view,
        position,
        projection
    }
}

export const GLTF_PARSE_hasCameras = (original:GLTF_ORIGINAL):boolean => 
    (original.cameras && original.cameras.length > 0);


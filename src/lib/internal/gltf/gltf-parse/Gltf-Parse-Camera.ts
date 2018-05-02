import { GLTF_ORIGINAL, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_Camera, GLTF_ORIGINAL_CameraPerspective, GLTF_ORIGINAL_CameraOrthographic, Camera } from '../../../Types';
import {mat4, vec3} from "gl-matrix";

const getOrthographicProjection = (cam:GLTF_ORIGINAL_CameraOrthographic) => {
    const values = new Float64Array(16).fill(0); 
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
    const values = new Float64Array(16).fill(0); 
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

const getCameraView = (modelMatrix:Float32Array) => 
    mat4.invert(mat4.create(),modelMatrix);

//not really tested yet - only affects fragment shader
const getCameraPosition = (modelMatrix:Float32Array) =>
    mat4.getTranslation(vec3.create(), modelMatrix) as Float32Array; 
 
export const GLTF_PARSE_getCamera = (originalCamera:GLTF_ORIGINAL_Camera) => (modelMatrix:Float32Array):Camera => {

    const view = getCameraView(modelMatrix);

    
    const projection = originalCamera.type === "perspective" 
        ? getPerspectiveProjection(originalCamera.perspective) 
        : getOrthographicProjection(originalCamera.orthographic) as Float64Array;

    return {
        view,
        projection
    }
}

export const GLTF_PARSE_hasCameras = (original:GLTF_ORIGINAL):boolean => 
    (original.cameras && original.cameras.length > 0);


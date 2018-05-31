import {Transform, CameraKind, NumberArray, OrthographicCameraSettings, PerspectiveCameraSettings, CameraSettings } from "../../../Types";
import {createVec3, createMat4} from "../array/Array";
import {mat4} from "gl-matrix";

const getOrthographicProjection = (cam:OrthographicCameraSettings) => {
    const values = createMat4(); 
    const r = cam.xmag;
    const t = cam.ymag;
    const n = cam.znear;
    const f = cam.zfar;

    values[0] = 1/r;
    values[5] = 1/t;
    values[10] = 2/(n - f);
    values[14] = (f+n) / (n-f);
    values[15] = 1;

    return values; 
}

const getPerspectiveProjection = (cam:PerspectiveCameraSettings) => {
    const values = createMat4(); 
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

export const getCameraProjection = (cam:CameraSettings) =>
    cam.kind == CameraKind.ORTHOGRAPHIC
    ?   getOrthographicProjection(cam)
    :   getPerspectiveProjection(cam);

export const getCameraView = (modelMatrix:NumberArray) => 
    mat4.invert(createMat4(),modelMatrix);

export const getCameraPosition = (modelMatrix:NumberArray) =>
    mat4.getTranslation(createVec3(), modelMatrix) as NumberArray; 

export const updateCameraWithTransform = <T extends CameraSettings>(transform:Transform) => (camera:T):T => 
    Object.assign({}, camera, {
            position: mat4.getTranslation(createVec3(), transform.localMatrix),
            view: getCameraView(transform.modelMatrix),
            projection: getCameraProjection(camera)
    });


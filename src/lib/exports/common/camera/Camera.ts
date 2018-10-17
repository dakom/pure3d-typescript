import {Transform, Camera, CameraKind, NumberArray, OrthographicCameraSettings, PerspectiveCameraSettings, CameraSettings } from "../../../Types";
import {createVec3, createMat4} from "../array/Array";
import {mat4} from "gl-matrix";
import { CameraNode } from "../../../types/common/nodes/Nodes-Types";

export const getOrthographicProjection = (settings:Partial<OrthographicCameraSettings>) => {
    const values = createMat4(); 
    const r = settings.xmag;
    const t = settings.ymag;
    const n = settings.znear;
    const f = settings.zfar;

    values[0] = 1/r;
    values[5] = 1/t;
    values[10] = 2/(n - f);
    values[14] = (f+n) / (n-f);
    values[15] = 1;

    return values; 
}

export const getPerspectiveProjection = (settings:Partial<PerspectiveCameraSettings>) => {
    const values = createMat4(); 
    const a = settings.aspectRatio === undefined && settings.canvas !== undefined
            ?   settings.canvas.clientWidth / settings.canvas.clientHeight
            :   settings.aspectRatio;
    const y = settings.yfov;
    const n = settings.znear;
    const f = settings.zfar; //if this is undefined, use infinite projection

    values[0] = 1/(a * Math.tan(.5 * y));
    values[5] = 1/(Math.tan(.5 * y));
    values[10] = f === undefined ? -1 : (f+n)/(n-f);
    values[11] = -1;
    values[14] = f === undefined ? (-2 * n) : (2 * f * n)/(n - f);


    return values; 
}

export const getCameraProjection = (settings:CameraSettings) =>
    settings.kind == CameraKind.ORTHOGRAPHIC
    ?   getOrthographicProjection(settings)
    :   getPerspectiveProjection(settings);

export const getCameraView = (modelMatrix:NumberArray) => 
    mat4.invert(createMat4(),modelMatrix);

export const getCameraPosition = (modelMatrix:NumberArray) =>
    mat4.getTranslation(createVec3(), modelMatrix) as NumberArray; 

export const setCameraViewFromTransform = (transform:Transform) => (camera:Camera):Camera =>
    Object.assign({}, camera, {
        view: getCameraView(transform.modelMatrix)
    });

export const setCameraPositionFromTransform = (transform:Transform) => (camera:Camera):Camera =>
    Object.assign({}, camera, {
        position: getCameraPosition(transform.modelMatrix)
    });

export const setCameraProjectionFromSettings = (settings:CameraSettings) => (camera:Camera):Camera => 
    Object.assign({}, camera, {
        projection: getCameraProjection(settings)
    })

export const getCameraFromNode = (cameraNode:CameraNode):Camera => 
    setCameraPositionFromTransform(cameraNode.transform) (
                setCameraViewFromTransform (cameraNode.transform) (
                    setCameraProjectionFromSettings (cameraNode.camera.settings) (cameraNode.camera)
                )
    )


export const getCameraFromNodeAndCanvas = (cameraNode:CameraNode) => (canvas:HTMLCanvasElement):Camera => {
    const settings = Object.assign({}, cameraNode.camera.settings, {canvas});
    const camera = Object.assign({}, cameraNode.camera, ({settings}));
    const node = Object.assign({}, cameraNode, {camera});

    return getCameraFromNode (node);
}
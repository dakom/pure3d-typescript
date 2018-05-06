import {NumberArray} from "../array/Array-Types";

export type Camera = OrthographicCamera | PerspectiveCamera;
export type CameraSettings = OrthographicCameraSettings | PerspectiveCameraSettings;
export type PerspectiveCamera = BaseCamera & PerspectiveCameraSettings 
export type OrthographicCamera = BaseCamera & OrthographicCameraSettings 

export enum CameraKind {
    PERSPECTIVE,
    ORTHOGRAPHIC
}

export interface BaseCamera {
    position?: NumberArray;
    view: NumberArray; 
    projection: NumberArray;
}

export interface OrthographicCameraSettings {
    kind: CameraKind.ORTHOGRAPHIC
    xmag: number;
    ymag: number;
    znear: number;
    zfar : number;
}


export interface PerspectiveCameraSettings {
    kind: CameraKind.PERSPECTIVE
    aspectRatio: number;
    yfov: number;
    znear: number;
    zfar: number;
}


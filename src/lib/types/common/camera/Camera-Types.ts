import {NumberArray} from "../array/Array-Types";

export type CameraSettings = OrthographicCameraSettings | PerspectiveCameraSettings;

export enum CameraKind {
    PERSPECTIVE,
    ORTHOGRAPHIC
}

export interface Camera {
    settings?:CameraSettings;
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


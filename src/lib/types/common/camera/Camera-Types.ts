import {NumberArray} from "../array/Array-Types";

export enum CameraKind {
    PERSPECTIVE,
    ORTHOGRAPHIC
}

export interface Camera {
  kind: CameraKind;
  view: NumberArray; 
  projection: NumberArray;
}

export interface PositionCamera extends Camera {
    position: NumberArray;
}

export interface OrthographicCamera extends PositionCamera {
    kind: CameraKind.ORTHOGRAPHIC
    xmag: number;
    ymag: number;
    znear: number;
    zfar : number;
}

export interface PerspectiveCamera extends PositionCamera {
    kind: CameraKind.PERSPECTIVE
    aspectRatio: number;
    yfov: number;
    znear: number;
    zfar: number;
}


import {NumberArray} from "../array/Array-Types";

export type Light = DirectionalLight | PointLight | SpotLight;

export enum LightKind {
    Directional = 1,
    Point,
    Spot

}

export interface BaseLight {
    color: NumberArray;
    intensity: number;
}

export interface DirectionalLight extends BaseLight {
    kind: LightKind.Directional;
    direction?: number;
}

export interface PointLight extends BaseLight {
    kind: LightKind.Point;
    range?: number;
}

export interface SpotLight extends BaseLight {
    kind: LightKind.Spot;
    direction?: number;
    angleScale:number;
    angleOffset:number;
    range:number;
}




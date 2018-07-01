
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
    kind: LightKind.Directional
}

export interface PointLight extends BaseLight {
    kind: LightKind.Point
}

export interface SpotLight extends BaseLight {
    kind: LightKind.Spot;
    innerConeAngle: number;
    outerConeAngle: number;
}




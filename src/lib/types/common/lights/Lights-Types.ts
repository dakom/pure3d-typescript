
import {NumberArray} from "../array/Array-Types";

export type Light = AmbientLight | DirectionalLight | PointLight | SpotLight;

export enum LightKind {
    Ambient = 1,
    Directional = 2,
    Point = 3,
    Spot = 4

}

export interface BaseLight {
    color: NumberArray;
    intensity: number;
}

export interface AmbientLight extends BaseLight {
    kind: LightKind.Ambient; 
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




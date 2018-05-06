
import {NumberArray} from "../array/Array-Types";

export type Light = DirectionalLight;

export enum LightKind {
    DIRECTIONAL = 1,
    POINT = 2

}

export interface DirectionalLight {
  kind: LightKind.DIRECTIONAL;
  direction: NumberArray;
  color: NumberArray;
}

//TODO - point, spot, etc. ... maybe via KHR extension?




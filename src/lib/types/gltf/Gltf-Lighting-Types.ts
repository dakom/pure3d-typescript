import {NumberArray} from "../common/array/Array-Types";

export type GltfLight = GltfDirectionalLight;

export enum GltfLightKind {
    DIRECTIONAL = 1,
    POINT = 2
}

export interface GltfDirectionalLight {
  kind: GltfLightKind.DIRECTIONAL;
  direction: NumberArray;
  color: NumberArray;
}

//TODO - point, spot, etc. ... maybe via KHR extension?

export interface GltfIblLight {
  scaleDiffBaseMR: NumberArray;
  scaleFGDSpec: NumberArray;
  scaleIBLAmbient: NumberArray;
  cameraPosition: NumberArray;
}



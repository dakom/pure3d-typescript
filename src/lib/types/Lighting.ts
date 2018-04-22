export type GltfLight = GltfDirectionalLight;

export enum GltfLightKind {
    DIRECTIONAL = 1,
    POINT = 2
}

export interface GltfDirectionalLight {
  kind: GltfLightKind.DIRECTIONAL;
  direction: Float32Array;
  color: Float32Array;
}

//TODO - point, spot, etc. ... maybe via KHR extension?

export interface GltfIblLight {
  scaleDiffBaseMR: Float32Array;
  scaleFGDSpec: Float32Array;
  scaleIBLAmbient: Float32Array;
  cameraPosition: Float32Array;
}



export enum GltfTransformKind {
  TRS = 1,
  MATRIX = 2
}

export interface GltfTransformValues_TRS {
  kind: GltfTransformKind.TRS;
  trs: {
    translation: Array<number>;
    rotation: Array<number>;
    scale: Array<number>;
  }
}

export interface GltfTransformValues_Matrix {
  kind: GltfTransformKind.MATRIX
  matrix: Array<number>;
}

export type GltfTransformValues = GltfTransformValues_TRS | GltfTransformValues_Matrix;

export type GltfTransformMatrices = {
  model: Float32Array;
  modelViewProjection: Float32Array;
  normal?: Float32Array;
}

export type GltfTransform = GltfTransformValues & GltfTransformMatrices;
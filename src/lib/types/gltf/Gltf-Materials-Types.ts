export enum GltfMaterialAlphaMode {
  OPAQUE = 1, //"OPAQUE" in original
  MASK = 2, //"MASK" in original
  BLEND = 3, //"BLEND" in original
  OTHER = 4
}
export interface GltfMaterial {
  metallicRoughnessValues: Float32Array;
  baseColorFactor: Float32Array;
  baseColorSamplerIndex?: number;
  metallicRoughnessSamplerIndex?: number;
  normal?: {
    scale: number;
    samplerIndex: number;
  }
  occlusion?: {
    strength: number;
    samplerIndex: number;
  }
  emissiveFactor?: Float32Array;
  emissiveSamplerIndex?: number;

  alphaMode?: GltfMaterialAlphaMode;
  alphaCutoff?: number;
  doubleSided?: boolean;
}

export interface GltfTextureInfo  {
  index? : number;
  texCoord?: number;
}

export interface GltfMaterialPbrMetallicRoughness {
  baseColorFactor?: Float32Array;
  baseColorTexture?: GltfTextureInfo;
  metallicFactor?: number;
  roughnessFactor?: number;
  metallicRoughnessTexture?: GltfTextureInfo;
}

export interface GltfMaterialNormalTextureInfo extends GltfTextureInfo {
  scale?: number;
}

export interface GltfMaterialOcclusionTextureInfo extends GltfTextureInfo {
  strength?: number;
}
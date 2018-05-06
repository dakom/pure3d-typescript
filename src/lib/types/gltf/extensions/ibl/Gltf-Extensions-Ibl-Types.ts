import {NumberArray} from "../../../common/array/Array-Types";

export interface GltfIblDataAssets {
    envData:GltfIblData; 
    imageMap:Map<string, HTMLImageElement>;
}

export interface GltfIbl {
  data: GltfIblData;
  textures: GltfIblTextures;
    light: GltfIblLight;
}

export type GltfIblCubeMapNames = "environment" | "specular" | "diffuse";
export type GltfIblCubeMapUrls = Array<[string, string, string, string, string, string]>

export interface GltfIblCubeMap {
  name: GltfIblCubeMapNames;
  colorSpace:number;
  urls: GltfIblCubeMapUrls
}

export interface GltfIblData {
  brdf: {
    url: string;
    colorSpace: number;
  };
  cubeMaps: Array<GltfIblCubeMap>
}


export interface GltfIblTextures {
  brdf: WebGLTexture;
  cubeMaps: {
    [K in GltfIblCubeMapNames]: WebGLTexture;
  }
}

export interface GltfIblLight {
  scaleDiffBaseMR: NumberArray;
  scaleFGDSpec: NumberArray;
  scaleIBLAmbient: NumberArray;
}

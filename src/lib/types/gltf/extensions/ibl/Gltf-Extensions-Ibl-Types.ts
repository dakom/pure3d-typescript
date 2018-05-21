import {NumberArray} from "../../../common/array/Array-Types";

export const GltfIblExtensionName = "PURE3D_IBL";

export type GltfIblCubeMapNames = "diffuse" | "specular";

//Assets
export interface GltfIblDataAssets {
    jsonData:GltfIblJson;
    imageMap:Map<string, HTMLImageElement>;
}

export interface GltfIblJson {
    brdf: {
        url: string;
        colorSpace: number;
    }
    cubeMaps: {
        [K in GltfIblCubeMapNames]: {
            colorSpace: number;
            urls: Array<Array<string>>;
        }
    }
    
}


//Data
export interface GltfIblData {
  brdf: WebGLTexture 
  cubeMaps: {
    [K in GltfIblCubeMapNames]: WebGLTexture;
  }
  useLod: boolean;
}


//Scene
export interface GltfIblScene {
  scaleDiffBaseMR: NumberArray;
  scaleFGDSpec: NumberArray;
  scaleIBLAmbient: NumberArray;
}

export enum GltfEnvironmentKind {
  PBR_IBL,
  EMPTY
}

export type GltfEnvironment = GltfEmptyEnvironment | GltfPbrEnvironment;

export interface GltfEmptyEnvironment {
  kind: GltfEnvironmentKind.EMPTY
}

export interface GltfPbrEnvironment {
  kind: GltfEnvironmentKind.PBR_IBL
  data: GltfPbrEnvironmentData;
  textures: GltfPbrEnvironmentTextures;
}

export type GltfPbrEnvironmentCubeMapNames = "environment" | "specular" | "diffuse";
export type GltfPbrEnvironmentCubeMapUrls = Array<[string, string, string, string, string, string]>

export interface GltfPbrEnvironmentCubeMap {
  name: GltfPbrEnvironmentCubeMapNames;
  colorSpace:number;
  urls: GltfPbrEnvironmentCubeMapUrls
}

export interface GltfPbrEnvironmentData {
  brdf: {
    url: string;
    colorSpace: number;
  };
  cubeMaps: Array<GltfPbrEnvironmentCubeMap>
}


export interface GltfPbrEnvironmentTextures {
  brdf: WebGLTexture;
  cubeMaps: {
    [K in GltfPbrEnvironmentCubeMapNames]: WebGLTexture;
  }
}
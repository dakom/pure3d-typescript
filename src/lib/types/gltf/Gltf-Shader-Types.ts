import {WebGlShader, GltfMaterialAlphaMode, GltfUnlitShaderConfig, GltfLightsShaderConfig, GltfIblShaderConfig} from "../../Types";

export interface GltfShaderConfig_Primitive {
    nMorphWeights: number;
    nPositionMorphs:number;
    nNormalMorphs: number;
    nTangentMorphs: number;
    nSkinJoints:number;
    hasNormalAttributes: boolean;
    hasTangentAttributes: boolean;
    hasUvAttributes: boolean;
    hasColorAttributes: boolean;
    hasBaseColorMap: boolean;
    hasNormalMap: boolean;
    hasEmissiveMap: boolean;
    hasMetalRoughnessMap: boolean;
    hasOcclusionMap: boolean;
    manualSRGB: boolean;
    fastSRGB: boolean;
    alphaMode: GltfMaterialAlphaMode;
    unlit: boolean;
}

export interface GltfShaderConfig_Scene {
    ibl?: GltfIblShaderConfig;
    unlit?: GltfUnlitShaderConfig;
    lights?: GltfLightsShaderConfig;
}

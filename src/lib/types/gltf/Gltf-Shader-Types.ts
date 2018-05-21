import {WebGlShader, GltfUnlitShaderConfig} from "../../Types";

export interface GltfShaderConfig {
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

    extensions: {
        unlit?: GltfUnlitShaderConfig
    }
}


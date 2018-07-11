import {NumberArray} from "../../../common/array/Array-Types";

export const GltfLightsExtensionName = "KHR_lights_punctual";

export const GltfLights_MAX = 10;

export interface GltfLightsShaderConfig {
    nPointLights: number;
    nDirectionalLights: number;
    nSpotLights: number;
}

export interface GLTF_PARSE_Extension_Lights_Config {
    light: number;
}

export interface GLTF_PARSE_Extension_Light {
    name?: string;
    color?: Array<number>;
    intensity?: number;
    spot?: {
        innerConeAngle?: number;
        outerConeAngle?: number;
    };
    type: "directional" | "point" | "spot" 
}

import {NumberArray} from "../../../common/array/Array-Types";

export const GltfLightsExtensionName = "KHR_lights";

export interface GltfLightsShaderConfig {
    nPointLights: number;
    nDirectionalLights: number;
    nSpotLights: number;
    hasAmbient: boolean;
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
    type: "directional" | "point" | "spot" | "ambient"
}

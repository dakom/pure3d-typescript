import {WebGlShader} from "../../Types";


export interface GltfShaderConfig {
    kind: GltfShaderKind;
}

export enum GltfShaderKind {
    PBR,
    PBR_UNLIT
}

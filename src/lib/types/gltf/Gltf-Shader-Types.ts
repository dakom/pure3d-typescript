import {WebGlShader} from "../../Types";

export interface GltfShaderMeta {
    kind: GltfShaderKind;
    shader: WebGlShader;
}
export enum GltfShaderKind {
    PBR,
    PBR_UNLIT
}

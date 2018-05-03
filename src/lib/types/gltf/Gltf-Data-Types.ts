import {WebGlAttributeActivateOptions, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";

export interface GltfData {
    original: GLTF_ORIGINAL,
    animations: Array<GltfAnimationData>;
    attributes: GltfAttributeData;
    textures: Map<number, WebGLTexture>;
    shaders: Map<number, WebGlShader>;
    vaoIds: Map<number, Symbol>;
}

export type GltfAttributeData = Map<number, {
    strategy: WebGlAttributeActivateOptions;
    rendererBufferId: Symbol;
}>

export interface GltfAccessorDataInfo extends _GltfAccessorDataInfo {
    sparse?: {
        indices: _GltfAccessorDataInfo;
        values: _GltfAccessorDataInfo;
    }
}

export interface _GltfAccessorDataInfo {
    bufferLength: number;
    componentType:number;
    accessorType:string;
    bufferViewIndex?:number;
    bufferIndex?:number;
    byteOffset?: number;
}

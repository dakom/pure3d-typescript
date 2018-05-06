import {WebGlAttributeActivateOptions, GltfIbl, GltfIblDataAssets, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";

export interface GltfDataAssets {
    buffers: Array<ArrayBuffer>
    imageElements: Array<HTMLImageElement>
    extensions: {
        ibl?: GltfIblDataAssets 
    }
}

export interface GltfData {
    original: GLTF_ORIGINAL,
    animations: Array<GltfAnimationData>;
    attributes: GltfAttributeData;
    textures: Map<number, WebGLTexture>;
    shaders: Map<number, WebGlShader>;
    vaoIds: Map<number, Symbol>;
    extensions: {
        ibl?: GltfIbl;
    }
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

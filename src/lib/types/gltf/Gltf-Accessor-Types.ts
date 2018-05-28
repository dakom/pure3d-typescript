import {GltfAttributes, WebGlAttributeActivateOptions, GltfInitConfig, WebGlVertexArrays, GltfIblData, GltfIblDataAssets, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";


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

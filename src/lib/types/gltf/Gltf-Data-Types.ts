import {WebGlAttributeActivateOptions, GltfInitConfig, GltfShaderMeta, WebGlVertexArrays, GltfIblData, GltfIblDataAssets, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";

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
    attributes: GltfAttributes;
    textures: Map<number, WebGLTexture>;
    shaders: Map<string, GltfShaderMeta>;
    config: GltfInitConfig;
    extensions: {
        ibl?: GltfIblData;
    }
}

export interface GltfAttributes {
    //Set on mesh primitives, because Symbols can't be serialized
    vaoIdLookup: Map<number, Symbol>;


    accessorLookup: Map<number, {
        strategy: WebGlAttributeActivateOptions;
        rendererBufferId: Symbol;
    }>;

    vertexArrays: WebGlVertexArrays;
}

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

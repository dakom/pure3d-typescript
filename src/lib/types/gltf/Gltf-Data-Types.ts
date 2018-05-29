import {GltfAttributes, GltfSkinData, WebGlAttributeActivateOptions, GltfInitConfig, WebGlVertexArrays, GltfIblData, GltfIblDataAssets, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";

export interface GltfDataAssets {
    buffers: Array<ArrayBuffer>
    imageElements: Array<HTMLImageElement>
    extensions: {
        ibl?: GltfIblDataAssets 
    }
}

export interface GltfData {
    original: GLTF_ORIGINAL,
    animations: Map<number, GltfAnimationData>;
    attributes: GltfAttributes;
    textures: Map<number, WebGLTexture>;
    shaders: Map<string, WebGlShader>;
    skins: Map<number, GltfSkinData>;
    initConfig: GltfInitConfig;
    extensions: {
        ibl?: GltfIblData;
    }
}


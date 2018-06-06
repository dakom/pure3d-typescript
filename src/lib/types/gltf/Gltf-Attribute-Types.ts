import {WebGlAttributeActivateOptions, GltfInitConfig, WebGlVertexArrays, GltfIblData, GltfIblDataAssets, WebGlShader, GLTF_ORIGINAL, GltfAnimationData, NumberArray} from "../../Types";


export interface GltfAttributes {
    //Set on mesh primitives, because Symbols can't be serialized
    vaoIdLookup: Map<number, Symbol>;


    accessorLookup: Map<number, {
        strategy: WebGlAttributeActivateOptions;
        rendererBufferId: Symbol;
    }>;

}

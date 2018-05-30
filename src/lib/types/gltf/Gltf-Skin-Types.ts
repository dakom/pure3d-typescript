import {GltfNode, TypedNumberArray, WebGlAttributeActivateOptions, GltfInitConfig, WebGlVertexArrays, WebGlShader, GLTF_ORIGINAL, NumberArray} from "../../Types";

export interface GltfSkinData {
    skeletonRootId?: number;
    joints: Array<{
        originalNodeId: number;
        inverseBindMatrix: TypedNumberArray;
    }>
}


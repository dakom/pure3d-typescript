import {GltfNode, TypedNumberArray, WebGlAttributeActivateOptions, GltfInitConfig, WebGlVertexArrays, WebGlShader, GLTF_ORIGINAL, NumberArray} from "../../Types";


export interface GltfSkinJoint {
    originalNodeId: number;
    inverseBindMatrix: TypedNumberArray;
}

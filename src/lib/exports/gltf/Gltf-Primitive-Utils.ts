import {
WebGlRenderer,
    CameraNode,
    NodeKind,
    WebGlBufferInfo,WebGlBufferData,
    LightNode,
    GltfMeshNode,
    GltfPrimitive,
    GltfNodeKind,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Scene,
    GltfScene,
    Camera,
    GltfNode,
    GltfInitConfig,
    GltfData,
    TypedNumberArray,
    GltfIblScene,
    GltfBridge,
    GltfDataAssets,
    AmbientLight,
} from '../../Types';

import {updateRuntimeShaderConfig} from "../../internal/gltf/gltf-parse/Gltf-Parse-Primitive-Shader";

export const gltf_updatePrimitiveShaderConfig = updateRuntimeShaderConfig; 


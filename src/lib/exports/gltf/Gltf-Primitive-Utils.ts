import {

    GltfCameraNode,
    GltfLightNode,
WebGlRenderer,
    CameraNode,
    NodeKind,
    WebGlBufferInfo,WebGlBufferData,
    LightNode,
    GltfMeshNode,
    GltfPrimitive,
    GltfShaderConfig_Scene,
    GltfShaderConfig_Primitive,
    GltfNodeKind,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Scene,
    GltfScene,
    Camera,
    GltfNode,
    GltfInitConfig,
    GltfData,
    TypedNumberArray,
    GltfBridge,
    GltfDataAssets,
} from '../../Types';

import {updateRuntimeShaderConfig_Primitive} from "../../internal/gltf/gltf-parse/Gltf-Parse-Shader";

export const gltf_updatePrimitiveShaderConfig = updateRuntimeShaderConfig_Primitive; 


import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfData,
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
    GltfLightsShaderConfig,
    GltfPrimitive,
    WebGlShaderSource,
    CameraNode,
    GltfNode,
    NodeKind,
    GltfUnlitExtensionName,
    GltfMeshNode,
    GltfScene,
    GltfDataAssets,
    PerspectiveCameraSettings,
    OrthographicCameraSettings,
    Light,
    LightKind,
    LightNode,
    DirectionalLight,
    PointLight,
    SpotLight,
    GLTF_PARSE_Extension,
} from "../../../../../Types"; 

import {
    loadAssets,
    createData,
    createScene,
    createNode,
    runtimeShaderConfig_Primitive,
    initialShaderConfig_Scene,
    runtimeShaderConfig_Scene,
} from "../Gltf-Parse-Extensions-Defaults";

import {GLTF_PARSE_getOriginalPrimitive} from "../../Gltf-Parse-Primitives";




const initialShaderConfig_Primitive = (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive):GltfShaderConfig_Primitive => {
    const primitive = GLTF_PARSE_getOriginalPrimitive (data) (originalIds.meshId) (originalIds.primitiveId);

    if(primitive.material == null) {
        return shaderConfig;
    }

    const gltf = data.original;
    const material = data.original.materials[primitive.material];

    if(material.extensions == null) {
        return shaderConfig;
    }

    if(gltf.extensionsUsed && gltf.extensionsUsed.indexOf(GltfUnlitExtensionName) !== -1 && Object.keys(material.extensions).indexOf(GltfUnlitExtensionName) !== -1) {

        return Object.assign({}, shaderConfig, {unlit: true});
    }
    
    return shaderConfig;
}


const getShaderSource = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig: GltfShaderConfig_Primitive) => (source:WebGlShaderSource):WebGlShaderSource => {
    if(primitiveShaderConfig.unlit) {
        console.log("UNLIT!");

        const defines = ["UNLIT"];
        const defineString = defines.map(value => `#define ${value} 1\n`).join('');
        return Object.assign({}, source, {
            vertex: defineString + source.vertex,
            fragment: defineString + source.fragment 
        })
    } else {
        return source;
    }
}

export const GLTF_PARSE_Extension_Unlit:GLTF_PARSE_Extension = {
    loadAssets,
    createData,
    createScene,
    createNode,
    initialShaderConfig_Primitive,
    runtimeShaderConfig_Primitive,
    initialShaderConfig_Scene,
    runtimeShaderConfig_Scene,
    getShaderSource
};

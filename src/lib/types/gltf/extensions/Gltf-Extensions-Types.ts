
import {
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfNode,
    GltfData,
    GltfScene,
    GltfDataAssets,
    CameraNode,
    WebGlRenderer,
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
    WebGlShaderSource,
    GltfPrimitive
} from "../../../Types"; 
import {Future} from "fluture";

export interface GLTF_PARSE_Extension {
    loadAssets : ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}) => Future<any, GltfDataAssets>;
    createData : ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData) => GltfData;
    createScene : (gltf:GLTF_ORIGINAL) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene) => GltfScene;
    createNode : (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode) => GltfNode; 
    initialShaderConfig_Primitive: (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive) => GltfShaderConfig_Primitive;
    runtimeShaderConfig_Primitive: (data:GltfData) => (scene: GltfScene) => (primitive: GltfPrimitive ) => (shaderConfig:GltfShaderConfig_Primitive) => GltfShaderConfig_Primitive;
    initialShaderConfig_Scene: (data:GltfData) => (scene:GltfScene) => (shaderConfig:GltfShaderConfig_Scene) => GltfShaderConfig_Scene;
    runtimeShaderConfig_Scene: (data:GltfData) => (scene: GltfScene) => (shaderConfig:GltfShaderConfig_Scene) => GltfShaderConfig_Scene;
    getShaderSource: (data:GltfData) => (sceneShaderconfig:GltfShaderConfig_Scene) => (primitiveShaderConfig: GltfShaderConfig_Primitive) => (source:WebGlShaderSource) => WebGlShaderSource; 
}

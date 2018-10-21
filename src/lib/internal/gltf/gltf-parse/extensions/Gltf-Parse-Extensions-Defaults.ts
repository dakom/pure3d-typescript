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
    GltfLightsExtensionName,
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
} from "../../../../Types"; 

export const loadAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Promise<GltfDataAssets> => Promise.resolve(coreData);


export const createData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData): GltfData => data;

export const createScene = (gltf:GLTF_ORIGINAL) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene):GltfScene =>  scene;

export const createNode = (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode):GltfNode =>  node;


export const initialShaderConfig_Primitive = (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive):GltfShaderConfig_Primitive => shaderConfig;

export const runtimeShaderConfig_Primitive = (scene: GltfScene) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive):GltfShaderConfig_Primitive => shaderConfig;

export const initialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene) => (shaderConfig:GltfShaderConfig_Scene):GltfShaderConfig_Scene => shaderConfig;


export const runtimeShaderConfig_Scene = (scene: GltfScene) => (shaderConfig:GltfShaderConfig_Scene):GltfShaderConfig_Scene => shaderConfig;


export const getShaderSource = (data:GltfData) => (sceneShaderconfig:GltfShaderConfig_Scene) => (primitiveShaderConfig: GltfShaderConfig_Primitive) => (source:WebGlShaderSource):WebGlShaderSource => source;

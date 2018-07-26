import {
    WebGlVertexArrayData, 
    GltfMaterialAlphaMode,
    GltfLightNode,
    GltfCameraNode,
    GltfMeshNode,
    OrthographicCameraSettings,
    CameraNode,
    PerspectiveCameraSettings,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Material,
    GLTF_ORIGINAL_MeshPrimitive,
    GltfNode,
    GltfData,
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
    GltfInitConfig,
    WebGlRenderer,
    WebGlBufferInfo,
    WebGlBufferData,
    WebGlAttributeActivateOptions,
    LightNode,
    GltfScene,
    GltfPrimitive,
    WebGlShaderSource,
    GltfLightsShaderConfig,
} from '../../../Types';
import { GLTF_PARSE_getPrimitiveAttributeKeys, GLTF_PARSE_sortPrimitiveAttributeKeys } from '../gltf-parse/Gltf-Parse-Primitive-Attributes';
import {GLTF_PARSE_primitiveIsUnlit} from "../gltf-parse/extensions/unlit/Gltf-Parse-Extensions-Unlit";

import {GltfExtensions} from "../gltf-parse/extensions/Gltf-Parse-Extensions";

import {createShader} from "../../../exports/webgl/WebGl-Shaders";
import {getShaderHash } from "./Gltf-Runtime-Shader-Hash";

import vertexShaderSource from "./glsl/Gltf-Shader-Vertex.glsl";
import fragmentShaderSource from "./glsl/Gltf-Pbr-Shader-Fragment.glsl";
//import unlitFragmentShader from "./Gltf-Unlit-Shader-Fragment.glsl";

export const updateRuntimeShaderConfig_Primitive = (scene:GltfScene) => (primitive:GltfPrimitive):GltfPrimitive=> {
  
    const shaderConfig = GltfExtensions
        .map(ext => ext.runtimeShaderConfig_Primitive)
        .reduce((acc, val) => (acc = val (scene) (primitive) (acc), acc), 
            primitive.shaderConfig
        );

    return Object.assign({}, primitive, {shaderConfig});
}


export const updateRuntimeShaderConfig_Scene = (scene:GltfScene):GltfScene => {
  
    const shaderConfig = GltfExtensions
        .map(ext => ext.runtimeShaderConfig_Scene)
        .reduce((acc, val) => (acc = val (scene) (acc), acc), 
            scene.shaderConfig
        );

    return Object.assign({}, scene, {shaderConfig});
}

export const getOrGenerateShader = ({renderer, data}:{renderer: WebGlRenderer, data: GltfData}) => (scene:GltfScene) => {
    const getHashForScene = getShaderHash (scene.shaderConfig);

    return (primitive:GltfPrimitive) => {

        const shaderHash = getHashForScene (primitive.shaderConfig);

        if (!data.shaders.has(shaderHash)) {
            const source = getShaderSource(data) (scene.shaderConfig) (primitive.shaderConfig) 

            const shader = createShader({
                shaderId: Symbol(),
                renderer,
                source,
            });

            data.shaders.set(shaderHash, shader);
            console.log(`new shader compiled`, shaderHash);
        } else {
            //console.log(`nice! re-using existing shader`);
        }


        const shader = data.shaders.get(shaderHash);


        return shader;
    }
}

const getShaderSource = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig:GltfShaderConfig_Primitive): WebGlShaderSource => 
    GltfExtensions
        .map(ext => ext.getShaderSource)
        .reduce((acc, val) => (acc = val (data) (sceneShaderConfig) (primitiveShaderConfig) (acc), acc), 
            getCoreShaderSource(data) (sceneShaderConfig) (primitiveShaderConfig)
        );

const getCoreShaderSource = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig:GltfShaderConfig_Primitive):WebGlShaderSource => {
    const gltf = data.original;

    const defines = [];

    if(primitiveShaderConfig.hasNormalAttributes) {
        defines.push("HAS_NORMALS");
    }

    if(primitiveShaderConfig.hasTangentAttributes) {
        defines.push("HAS_TANGENTS");
    }

    if(primitiveShaderConfig.hasUvAttributes) {
        defines.push("HAS_UV");
    }

    if(primitiveShaderConfig.hasColorAttributes) {
        defines.push("HAS_COLOR");
    }

    if(primitiveShaderConfig.hasBaseColorMap) {
        defines.push("HAS_BASECOLORMAP");
    }

    if(primitiveShaderConfig.hasNormalMap) {
        defines.push("HAS_NORMALMAP");
    }

    if(primitiveShaderConfig.hasEmissiveMap) {
        defines.push("HAS_EMISSIVEMAP");
    }

    if(primitiveShaderConfig.hasMetalRoughnessMap) {
        defines.push("HAS_METALROUGHNESSMAP");
    }

    if(primitiveShaderConfig.hasOcclusionMap) {
        defines.push("HAS_OCCLUSIONMAP");
    }

    if(primitiveShaderConfig.manualSRGB) {
        defines.push("MANUAL_SRGB");
    }

    if(primitiveShaderConfig.fastSRGB) {
        defines.push("SRGB_FAST_APPROXIMATION");
    }

    if(primitiveShaderConfig.nSkinJoints) {
        defines.push("HAS_SKIN");
    }

    switch(primitiveShaderConfig.alphaMode) {
        case GltfMaterialAlphaMode.MASK: defines.push("HAS_ALPHA_CUTOFF"); break;
        case GltfMaterialAlphaMode.BLEND: defines.push("HAS_ALPHA_BLEND"); break;
    }

    const defineString = defines.map(value => `#define ${value} 1\n`).join('');

    const vertex = getCoreVertexShader (data) (sceneShaderConfig) (primitiveShaderConfig) (defineString + vertexShaderSource);

    const fragment = defineString + fragmentShaderSource;

    return {vertex, fragment}
}


const getCoreVertexShader = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig:GltfShaderConfig_Primitive) => (vs:string):string => {
    let MORPH_VARS = '';
    let MORPH_FUNCS = '';

    let morphIndex = 0;
    let weightIndex = 0;

    const createMorphs = (nMorphs:number) => (aTarget:string) => {
        for(let i = 0; i < nMorphs; i++) {
            const aMorph = `a_Morph_${morphIndex}`;

            MORPH_VARS += `attribute vec4 ${aMorph};\n`;

            MORPH_FUNCS += `${aTarget} += (u_MorphWeights[${weightIndex}] * ${aMorph});\n`;
            morphIndex++;
        }

        weightIndex++;
    }

    if(primitiveShaderConfig.nPositionMorphs) {
        createMorphs(primitiveShaderConfig.nPositionMorphs) ("m_Position");
    }


    if(primitiveShaderConfig.nNormalMorphs) {
        createMorphs(primitiveShaderConfig.nPositionMorphs) ("m_Normal");
    }


    if(primitiveShaderConfig.nTangentMorphs) {
        createMorphs(primitiveShaderConfig.nPositionMorphs) ("m_Tangent");
    }

    if(weightIndex) {
        MORPH_VARS += `uniform float u_MorphWeights[${weightIndex}];\n`;
    }

    let SKIN_JOINT_COUNT = '';

    if(primitiveShaderConfig.nSkinJoints) {
        SKIN_JOINT_COUNT = primitiveShaderConfig.nSkinJoints.toString(); 
    }

    return vs
        .replace("%MORPH_VARS%", MORPH_VARS)
        .replace("%MORPH_FUNCS%", MORPH_FUNCS)
        .replace("%SKIN_JOINT_COUNT%", SKIN_JOINT_COUNT);
}



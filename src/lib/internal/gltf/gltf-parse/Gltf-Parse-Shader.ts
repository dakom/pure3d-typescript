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

import {GLTF_PARSE_attributeNames} from "../gltf-parse/Gltf-Parse-Data-Attributes";
import {createShader} from "../../../exports/webgl/WebGl-Shaders";
import {getShaderHash } from "./Gltf-Parse-Shader-Hash";

import vertexShaderSource from "../shaders/Gltf-Shader-Vertex.glsl";
import fragmentShaderSource from "../shaders/Gltf-Pbr-Shader-Fragment.glsl";
//import unlitFragmentShader from "./Gltf-Unlit-Shader-Fragment.glsl";

//These need to be called via bridge/setup somehow
export const GLTF_PARSE_getInitialShaderConfig_Primitive = (data:GltfData) => (primitive:GltfPrimitive):GltfShaderConfig_Primitive => 
    GltfExtensions
        .map(ext => ext.initialShaderConfig_Primitive)
        .reduce((acc, val) => (acc = val (data) (primitive) (acc), acc), 
            getCoreInitialShaderConfig_Primitive(data) (primitive)
        );

export const GLTF_PARSE_getInitialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene):GltfShaderConfig_Scene =>  
    GltfExtensions
        .map(ext => ext.initialShaderConfig_Scene)
        .reduce((acc, val) => (acc = val (data) (scene) (acc), acc), 
            getCoreInitialShaderConfig_Scene(data) (scene)
        );
export const updateRuntimeShaderConfig_Primitive = ({data, scene}:{data:GltfData, scene:GltfScene}) => (primitive:GltfPrimitive):GltfPrimitive=> {
  
    const shaderConfig = GltfExtensions
        .map(ext => ext.runtimeShaderConfig_Primitive)
        .reduce((acc, val) => (acc = val (data) (scene) (primitive) (acc), acc), 
            Object.assign({}, primitive.shaderConfig)
        );

    return Object.assign({}, primitive, {shaderConfig});
}


export const updateRuntimeShaderConfig_Scene = (data:GltfData) => (scene:GltfScene):GltfScene => {
  
    const shaderConfig = GltfExtensions
        .map(ext => ext.runtimeShaderConfig_Scene)
        .reduce((acc, val) => (acc = val (data) (scene) (acc), acc), 
            Object.assign({}, scene.shaderConfig)
        );

    return Object.assign({}, scene, {shaderConfig});
}

export const generateShader = ({renderer, data}:{renderer: WebGlRenderer, data: GltfData}) => (scene:GltfScene) => {
    const getConfigForScene = getShaderHash (scene.shaderConfig);

    return (primitive:GltfPrimitive) => {

        const shaderHash = getConfigForScene (primitive.shaderConfig);

        if (!data.shaders.has(shaderHash)) {
            const source = getShaderSource(data) (scene) (primitive);

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

const getCoreInitialShaderConfig_Primitive = (data:GltfData) => (primitive:GltfPrimitive):GltfShaderConfig_Primitive => {
    const gltf = data.original;

    const originalNode = data.original.nodes[primitive.originalNodeId];

    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];

    const hasAttribute = (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive) => (attr: string): boolean => 
        Object.keys(originalPrimitive.attributes).indexOf(attr) !== -1;

    const material = primitive.material;
   
    let nMorphWeights = 0;
    let nPositionMorphs = 0;
    let nNormalMorphs = 0;
    let nTangentMorphs = 0;
    let nSkinJoints = 0;
 
    if(originalNode.skin !== undefined) {
        const skin = data.original.skins[originalNode.skin];
        nSkinJoints = skin.joints.length;
    }
    
    if(originalPrimitive.targets) {
        originalPrimitive.targets.forEach(target => {
            GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(target)).forEach(key => {
                switch(key) {
                    case "POSITION": nPositionMorphs++; break;
                    case "NORMAL": nNormalMorphs++; break;
                    case "TANGENT": nTangentMorphs++; break;
                    default: console.warn("unknown...", key);
                }
            })

            nMorphWeights++;
        })
    }
    const shaderConfig:GltfShaderConfig_Primitive = {
        nMorphWeights,
        nPositionMorphs,
        nNormalMorphs,
        nTangentMorphs,
        nSkinJoints,
        alphaMode: (material && material.alphaMode) ? material.alphaMode : GltfMaterialAlphaMode.OPAQUE,
        hasNormalAttributes: hasAttribute (originalPrimitive) ("NORMAL"),
        hasTangentAttributes: hasAttribute (originalPrimitive) ("TANGENT"),
        hasUvAttributes: hasAttribute (originalPrimitive) ("TEXCOORD_0"),

        hasColorAttributes: hasAttribute(originalPrimitive) ("COLOR_0"),
        hasBaseColorMap: material && material.baseColorSamplerIndex !== undefined,
        hasNormalMap: material && material.normal !== undefined,
        hasEmissiveMap: material && material.emissiveSamplerIndex !== undefined,
        hasMetalRoughnessMap: material && material.metallicRoughnessSamplerIndex !== undefined,
        hasOcclusionMap: material && material.occlusion !== undefined,
        manualSRGB: data.initConfig.manualSRGB === true,
        fastSRGB: data.initConfig.fastSRGB === true,
    }

    return shaderConfig;
}


const getCoreInitialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene):GltfShaderConfig_Scene => ({
    
})

const getCoreShaderSource = ({data, primitive }:{data:GltfData, primitive: GltfPrimitive }):WebGlShaderSource => {
    const gltf = data.original;
    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];

    const config = primitive.shaderConfig;

    const defines = [];

    if(config.hasNormalAttributes) {
        defines.push("HAS_NORMALS");
    }

    if(config.hasTangentAttributes) {
        defines.push("HAS_TANGENTS");
    }

    if(config.hasUvAttributes) {
        defines.push("HAS_UV");
    }

    if(config.hasColorAttributes) {
        defines.push("HAS_COLOR");
    }

    if(config.hasBaseColorMap) {
        defines.push("HAS_BASECOLORMAP");
    }

    if(config.hasNormalMap) {
        defines.push("HAS_NORMALMAP");
    }

    if(config.hasEmissiveMap) {
        defines.push("HAS_EMISSIVEMAP");
    }

    if(config.hasMetalRoughnessMap) {
        defines.push("HAS_METALROUGHNESSMAP");
    }

    if(config.hasOcclusionMap) {
        defines.push("HAS_OCCLUSIONMAP");
    }

    if(config.manualSRGB) {
        defines.push("MANUAL_SRGB");
    }

    if(config.fastSRGB) {
        defines.push("SRGB_FAST_APPROXIMATION");
    }

    if(config.nSkinJoints) {
        defines.push("HAS_SKIN");
    }

    switch(config.alphaMode) {
        case GltfMaterialAlphaMode.MASK: defines.push("HAS_ALPHA_CUTOFF"); break;
        case GltfMaterialAlphaMode.BLEND: defines.push("HAS_ALPHA_BLEND"); break;
    }

    const defineString = defines.map(value => `#define ${value} 1\n`).join('');

    const vertex = getCoreVertexShader ({data, primitive}) (defineString + vertexShaderSource);

    const fragment = getCoreFragmentShader(defineString + fragmentShaderSource);

    return {vertex, fragment}
}


const getCoreVertexShader = ({data, primitive }:{data:GltfData, primitive: GltfPrimitive }) => (vs:string):string => {
    const originalNode = data.original.nodes[primitive.originalNodeId];
    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];
    const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);
    const {targets} = originalPrimitive;
    const shaderMorphVarLookup = {
        "POSITION": "m_Position",
        "NORMAL": "m_Normal",
        "TANGENT": "m_Tangent",
    }

    let MORPH_VARS = '';
    let MORPH_FUNCS = '';

    let morphIndex = 0;
    let weightIndex = 0;

    if(targets) {

        targets.forEach(target => {
            GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(target)).forEach(key => {
                const aMorph = `a_Morph_${morphIndex}`;
                const aTarget = shaderMorphVarLookup[key];

                MORPH_VARS += `attribute vec4 ${aMorph};\n`;

                MORPH_FUNCS += `${aTarget} += (u_MorphWeights[${weightIndex}] * ${aMorph});\n`;

                morphIndex++;
            })
            weightIndex++;
        })

        MORPH_VARS += `uniform float u_MorphWeights[${weightIndex}];\n`;
    }

    let SKIN_JOINT_COUNT = '';

    if(originalNode.skin !== undefined) {
        const skin = data.original.skins[originalNode.skin];
        SKIN_JOINT_COUNT = skin.joints.length.toString();
       
    }
    return vs
        .replace("%MORPH_VARS%", MORPH_VARS)
        .replace("%MORPH_FUNCS%", MORPH_FUNCS)
        .replace("%SKIN_JOINT_COUNT%", SKIN_JOINT_COUNT);
}

const getCoreFragmentShader = (fs:string):string => fs;

const getShaderSource = (data:GltfData) => (scene:GltfScene) => (primitive:GltfPrimitive): WebGlShaderSource => 
    GltfExtensions
        .map(ext => ext.shaderSource)
        .reduce((acc, val) => (acc = val (data) (scene) (primitive) (acc), acc), 
            getCoreShaderSource({data, primitive})
        );

